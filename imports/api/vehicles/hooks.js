import { diff } from 'just-diff'
import objectPath from 'object-path'

import { Vehicles, Contacts } from '../database'
import { insertHistoryLog } from '../history-log/functions'
import { HistoryLogTypesEnum } from '../history-log/enums'

const notAllowedFields = [
  '_id',
  'code',
  'createdById',
  'createdAt',
  'updatedAt',
  'makeModel',
  'searchableMake',
  'searchableModel',
  'searchableMakeModel',
  'searchableTags',
  'searchableBodyType',
  'searchableFuelType',
  'searchableEngine',
  'searchableGearbox',
  'searchableDrivetrain'
]

function updateOwnerVehicleCount(_userId, vehicle) {
  const vehiclesLink = Contacts.getLink(vehicle.ownerId, 'vehicles')
  const vehicleCount = vehiclesLink.find({ isActive: true }, { fields: { _id: 1 } }).count()
  Contacts.update(vehicle.ownerId, { $set: { vehicleCount } })

  if (this.previous) {
    const prevOwnerVehiclesLink = Contacts.getLink(this.previous.ownerId, 'vehicles')
    const prevOwnerVehicleCount = prevOwnerVehiclesLink.find(
      { isActive: true },
      { fields: { _id: 1 } }
    ).count()
    Contacts.update(this.previous.ownerId, { $set: { vehicleCount: prevOwnerVehicleCount } })
  }
}

function insertHistoryLogToOwnerAfterInsert(userId, vehicle) {
  insertHistoryLog({
    type: HistoryLogTypesEnum.LINK,
    metadata: {
      linkType: 'vehicle',
      vehicle: {
        _id: vehicle._id,
        code: vehicle.code,
        makeModel: vehicle.makeModel,
        regNumber: vehicle.regNumber
      }
    },
    contactId: vehicle.ownerId,
    createdById: userId,
    createdAt: vehicle.updatedAt
  })
}

function insertHistoryLogToOwnersAfterUpdate(userId, vehicle) {
  if (vehicle.ownerId === this.previous.ownerId) {
    return
  }

  insertHistoryLog({
    type: HistoryLogTypesEnum.LINK,
    metadata: {
      linkType: 'vehicle',
      vehicle: {
        _id: vehicle._id,
        code: vehicle.code,
        makeModel: vehicle.makeModel,
        regNumber: vehicle.regNumber
      }
    },
    contactId: vehicle.ownerId,
    createdById: userId,
    createdAt: new Date()
  })

  insertHistoryLog({
    type: HistoryLogTypesEnum.UNLINK,
    metadata: {
      linkType: 'vehicle',
      vehicle: {
        _id: vehicle._id,
        code: vehicle.code,
        makeModel: vehicle.makeModel,
        regNumber: vehicle.regNumber
      }
    },
    contactId: this.previous.ownerId,
    createdById: userId,
    createdAt: new Date()
  })
}

function insertHistoryLogToOwnerAfterDelete(userId, vehicle) {
  insertHistoryLog({
    type: HistoryLogTypesEnum.UNLINK_DELETE,
    metadata: {
      linkType: 'vehicle',
      vehicle: {
        _id: vehicle._id,
        code: vehicle.code,
        makeModel: vehicle.makeModel,
        regNumber: vehicle.regNumber
      }
    },
    contactId: vehicle.ownerId,
    createdById: userId,
    createdAt: new Date()
  })
}

const addInsertToHistory = (_userId, vehicle) => {
  const prev = { tags: [] }
  const rawChanges = diff(prev, vehicle)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change

    let isAllowed = true
    path.forEach((item) => {
      if (notAllowedFields.includes(item) || item === 'isActive') {
        isAllowed = false
      }
    })
    if (isAllowed) {
      changeList.push({ op, path, value })
    }
  })

  if (changeList.length === 0) {
    return
  }

  insertHistoryLog({
    type: HistoryLogTypesEnum.INSERT,
    metadata: { changeList },
    vehicleId: vehicle._id,
    createdById: vehicle.createdById,
    createdAt: vehicle.updatedAt
  })
}

const addUpdateToHistory = function(userId, vehicle) {
  const prev = this.previous
  const rawChanges = diff(prev, vehicle)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change
    const oldValue = objectPath.get(prev, path.join('.'))

    let isAllowed = true
    path.forEach((item) => {
      if (notAllowedFields.includes(item)) {
        isAllowed = false
      }
    })
    if (isAllowed) {
      changeList.push({ op, path, value, oldValue })
    }
  })

  if (changeList.length === 0) {
    return
  }

  if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && changeList[0].value) {
    insertHistoryLog({
      type: HistoryLogTypesEnum.ACTIVATION,
      vehicleId: vehicle._id,
      createdById: userId,
      createdAt: new Date()
    })
  } else if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && !changeList[0].value) {
    insertHistoryLog({
      type: HistoryLogTypesEnum.DEACTIVATION,
      vehicleId: vehicle._id,
      createdById: userId,
      createdAt: new Date()
    })
  } else if (changeList.length === 1 && changeList[0].path[0] === 'notes') {
    insertHistoryLog({
      type: HistoryLogTypesEnum.NOTES_UPDATE,
      metadata: { changeList },
      vehicleId: vehicle._id,
      createdById: userId,
      createdAt: vehicle.updatedAt
    })
  } else {
    insertHistoryLog({
      type: HistoryLogTypesEnum.UPDATE,
      metadata: { changeList },
      vehicleId: vehicle._id,
      createdById: userId,
      createdAt: vehicle.updatedAt
    })
  }
}

Vehicles.after.insert(addInsertToHistory)
Vehicles.after.insert(updateOwnerVehicleCount)
Vehicles.after.insert(insertHistoryLogToOwnerAfterInsert)

Vehicles.after.update(addUpdateToHistory)
Vehicles.after.update(updateOwnerVehicleCount)
Vehicles.after.update(insertHistoryLogToOwnersAfterUpdate)

Vehicles.after.remove(updateOwnerVehicleCount)
Vehicles.after.remove(insertHistoryLogToOwnerAfterDelete)
