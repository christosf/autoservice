import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Vehicles } from '../database'
import { VehiclesQueue } from './collection'
import { vehicleHasUpdates } from './functions'
import { convertToSearchableRegex, convertToSearchableString } from '../core/functions'
import { CounterNamesEnum } from '../counters/enums'

const searchableField = (field) => {
  switch (field) {
    case 'make': return 'searchableMake'
    case 'model': return 'searchableModel'
    case 'makeModel': return 'searchableMakeModel'
    case 'tags': return 'searchableTags'
    case 'bodyType': return 'searchableBodyType'
    case 'fuelType': return 'searchableFuelType'
    case 'engine': return 'searchableEngine'
    case 'gearbox': return 'searchableGearbox'
    case 'drivetrain': return 'searchableDrivetrain'
    default: return field
  }
}

const insertVehicle = (params) => {
  const task = VehiclesQueue.add(() => {
    const vehicle = { ...params }

    vehicle.code = `V${Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.VEHICLES })}`
    vehicle.makeModel = `${vehicle.make} ${vehicle.model}`

    const _id = Vehicles.insert(vehicle)

    return {
      added: !!_id,
      _id,
      code: vehicle.code
    }
  })

  return task.promise
}

const updateVehicle = (params) => {
  const schema = new SimpleSchema({
    vehicleId: String,
    vehicle: {
      type: Object,
      blackbox: true
    }
  })
  schema.validate(schema.clean(params))

  const { vehicleId, vehicle } = params

  if (!vehicleHasUpdates({ vehicleId, updated: vehicle })) {
    throw new Meteor.Error('no-updated-fields')
  }

  vehicle.makeModel = `${vehicle.make} ${vehicle.model}`

  const fieldsToSet = {}
  const fieldsToUnset = {}
  Object.keys(vehicle).forEach((field) => {
    if (typeof vehicle[field] === 'string' && vehicle[field] === '') {
      fieldsToUnset[field] = ''
    } else {
      fieldsToSet[field] = vehicle[field]
    }
  })
  fieldsToSet.updatedAt = new Date()

  return {
    updated: Vehicles.update(vehicleId, { $set: fieldsToSet, $unset: fieldsToUnset }) === 1
  }
}

const deleteVehicle = (params) => {
  const schema = new SimpleSchema({ vehicleId: String })
  schema.validate(schema.clean(params))

  const { vehicleId } = params

  // TODO: Do not allow if vehicles has jobcards.
  return { deleted: Vehicles.remove(vehicleId) === 1 }
}

const activateVehicle = (params) => {
  const schema = new SimpleSchema({ vehicleId: String })
  schema.validate(schema.clean(params))

  const { vehicleId } = params

  return { activated: Vehicles.update(vehicleId, { $set: { isActive: true } }) === 1 }
}

const deactivateVehicle = (params) => {
  const schema = new SimpleSchema({ vehicleId: String })
  schema.validate(schema.clean(params))

  const { vehicleId } = params

  return { deactivated: Vehicles.update(vehicleId, { $set: { isActive: false } }) === 1 }
}

const updateVehicleNotes = (params) => {
  const schema = new SimpleSchema({
    vehicleId: String,
    notes: {
      type: String,
      optional: true
    }
  })
  schema.validate(schema.clean(params))

  const { vehicleId, notes } = params

  return {
    updated: Vehicles.update(
      vehicleId,
      notes
        ? { $set: { notes, updatedAt: new Date() } }
        : { $unset: { notes }, $set: { updatedAt: new Date() } }
    ) === 1
  }
}

const fieldValueExists = (params) => {
  const schema = new SimpleSchema({
    field: String,
    value: {
      type: String,
      defaultValue: ''
    },
    excludeId: {
      type: String,
      optional: true
    }
  })
  schema.validate(schema.clean(params))

  const { field, value, excludeId } = params

  const query = excludeId ? { _id: { $ne: excludeId } } : {}
  query[searchableField(field)] = convertToSearchableString(value)

  return !!Vehicles.findOne(query, { fields: { _id: 1 } })
}

const getDistinctFieldValues = async(params) => {
  const schema = new SimpleSchema({
    field: String,
    filter: {
      type: String,
      defaultValue: ''
    },
    basedOn: {
      type: String,
      defaultValue: ''
    }
  })
  schema.validate(schema.clean(params))

  const { field, basedOn } = params

  const filter = convertToSearchableRegex(params.filter)
  const query = {}

  query[searchableField(field)] = { $regex: filter }

  if (field === 'model' && basedOn) {
    query.searchableMake = convertToSearchableString(basedOn)
  }

  const response = await Vehicles.rawCollection().distinct(field, query)

  return response.filter((item) => new RegExp(filter).test(convertToSearchableString(item)))
}

const getPrevNextVehicleCode = async(params) => {
  const schema = new SimpleSchema({
    type: {
      type: 'String',
      allowedValues: ['prev', 'next']
    },
    vehicleId: String,
    sortBy: String,
    descending: Boolean
  })
  schema.validate(schema.clean(params))

  const { type, vehicleId, sortBy, descending } = params

  const sortOrder = descending ? -1 : 1
  const reversedSortOrder = descending ? 1 : -1
  const sort = {}
  const reversedSort = {}
  switch (sortBy) {
    case 'make':
      sort.searchableMake = sortOrder
      sort.searchableModel = 1
      sort.updatedAt = -1
      reversedSort.searchableMake = reversedSortOrder
      reversedSort.searchableModel = 1
      reversedSort.updatedAt = -1
      break
    case 'model':
      sort.searchableModel = sortOrder
      sort.updatedAt = -1
      reversedSort.searchableModel = reversedSortOrder
      reversedSort.updatedAt = -1
      break
    default:
      sort[sortBy] = sortOrder
      reversedSort[sortBy] = reversedSortOrder
  }

  const cursor = Vehicles.rawCollection().aggregate([
    {
      $setWindowFields: {
        sortBy: sort,
        output: {
          prevCode: {
            $first: '$code',
            window: {
              documents: [-1, 0]
            }
          },
          nextCode: {
            $last: '$code',
            window: {
              documents: [0, 1]
            }
          }
        }
      }
    },
    {
      $match: {
        _id: vehicleId
      }
    },
    {
      $project: {
        code: 1,
        prevCode: 1,
        nextCode: 1
      }
    }
  ])

  const result = await cursor.next()
  cursor.close()

  if (type === 'prev' && result.code === result.prevCode) {
    result.prevCode = Vehicles.findOne({}, { fields: { code: 1 }, sort: reversedSort }).code
  } else if (type === 'next' && result.code === result.nextCode) {
    result.nextCode = Vehicles.findOne({}, { fields: { code: 1 }, sort }).code
  }

  return type === 'prev' ? result.prevCode : result.nextCode
}

const getBasicDetails = (params) => {
  const schema = new SimpleSchema({ vehicleId: String })
  schema.validate(schema.clean(params))

  const { vehicleId } = params

  return Vehicles.findOne(vehicleId, { fields: { regNumber: 1, makeModel: 1 } })
}

Meteor.methods({
  'vehicles.insert': insertVehicle,
  'vehicles.update': updateVehicle,
  'vehicles.delete': deleteVehicle,
  'vehicles.activate': activateVehicle,
  'vehicles.deactivate': deactivateVehicle,
  'vehicles.updateNotes': updateVehicleNotes,
  'vehicles.fieldValueExists': fieldValueExists,
  'vehicles.getDistinctFieldValues': getDistinctFieldValues,
  'vehicles.getPrevNextVehicleCode': getPrevNextVehicleCode,
  'vehicles.getBasicDetails': getBasicDetails
})
