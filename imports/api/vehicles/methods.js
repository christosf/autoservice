import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../database'
import { CounterNamesEnum } from '../counters/enums'
import { VehiclesQueue } from './collection'
import { convertToSearchableRegex, convertToSearchableString } from '../core/functions'
import { vehicleHasUpdates } from './functions'

const searchableField = field => {
    switch(field) {
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

Meteor.methods({
    async 'vehicles.insert'(params) {
        return await VehiclesQueue.add(() => {
            const vehicle = { ...params }

            vehicle.code = 'V' + Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.VEHICLES })
            vehicle.makeModel = `${vehicle.make} ${vehicle.model}`
            
            const _id = Vehicles.insert(vehicle)

            return {
                added: true,
                _id,
                code: vehicle.code
            }
        }).promise
    },
    'vehicles.update'(params) {
        const schema = new SimpleSchema({
            _id: String,
            vehicle: {
                type: Object,
                blackbox: true
            }
        })
        schema.validate(schema.clean(params))

        const { _id, vehicle } = params

        if (!vehicleHasUpdates(_id, vehicle)) {
            throw new Meteor.Error('no-updated-fields')
        }
        
        vehicle.makeModel = `${vehicle.make} ${vehicle.model}`

        const fieldsToSet = {}
        const fieldsToUnset = {}
        Object.keys(vehicle).forEach(field => {
            if (typeof vehicle[field] === 'string' && vehicle[field] === '') {
                fieldsToUnset[field] = ''
            } else {
                fieldsToSet[field] = vehicle[field]
            }
        })
        fieldsToSet.updatedAt = new Date()

        return { updated: Vehicles.update(_id, { $set: fieldsToSet, $unset: fieldsToUnset }) === 1 }
    },
    'vehicles.delete'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        // TODO: Do not allow if vehicles has jobcards.
        return { deleted: Vehicles.remove(_id) === 1 }
    },
    'vehicles.deactivate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deactivated: Vehicles.update(_id, { $set: { isActive: false }}) === 1 }
    },
    'vehicles.activate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { activated: Vehicles.update(_id, { $set: { isActive: true }}) === 1 }
    },
    'vehicles.updateNotes'(params) {
        const schema = new SimpleSchema({
            _id: String,
            notes: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))
        
        const { _id, notes } = params

        return {
            updated: Vehicles.update(_id, notes
                ? { $set: { notes, updatedAt: new Date() }}
                : { $unset: { notes }, $set: { updatedAt: new Date() }}
            ) === 1
        }
    },
    'vehicles.fieldValueExists'(params) {
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

        return !!Vehicles.findOne(query, { fields: { _id: 1 }})
    },
    async 'vehicles.getDistinctFieldValues'(params) {
        const schema = new SimpleSchema({
            field: String,
            filter: {
                type: String,
                defaultValue: ''
            }
        })
        schema.validate(schema.clean(params))

        const { field } = params       
        const filter = convertToSearchableRegex(params.filter)
        const query = {}

        query[searchableField(field)] = { $regex: filter }

        const response = await Vehicles.rawCollection().distinct(field, query)

        return response.filter(item => {
            return new RegExp(filter).test(convertToSearchableString(item))
        })
    },
    'vehicles.getBasicDetails'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))
        
        const { _id } = params

        return Vehicles.findOne(_id, { fields: { regNumber: 1, makeModel: 1 }})
    }
})
