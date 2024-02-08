import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import codeSchema from '../core/schemas/code'
import timestampSchema from '../core/schemas/timestamp'
import isActiveSchema from '../core/schemas/is_active'
import tagsSchema from '../core/schemas/tags'
import vehicleSchema from './schema'

const Vehicles = new Mongo.Collection('vehicles', { defineMutationMethods: false })
const VehiclesQueue = new Queue()

Vehicles.attachSchema(codeSchema)
Vehicles.attachSchema(timestampSchema)
Vehicles.attachSchema(isActiveSchema)
Vehicles.attachSchema(tagsSchema)
Vehicles.attachSchema(vehicleSchema)

if (Meteor.isServer) {
  Vehicles.createIndexAsync({ code: 1 }, {
    name: 'codeIndex',
    unique: true
  })

  Vehicles.createIndexAsync({ regNumber: 1 }, {
    name: 'regNumberIndex',
    unique: true,
    sparse: true
  })

  Vehicles.createIndexAsync({ chassisNumber: 1 }, {
    name: 'chassisNumberIndex',
    unique: true,
    sparse: true
  })

  Vehicles.createIndexAsync({ searchableMake: 1 }, { name: 'searchableMakeIndex' })
  Vehicles.createIndexAsync({ searchableModel: 1 }, { name: 'searchableModelIndex' })
  Vehicles.createIndexAsync({ searchableMakeModel: 1 }, { name: 'searchableMakeModelIndex' })
  Vehicles.createIndexAsync({ searchableBodyType: 1 }, { name: 'searchableBodyTypeIndex' })
  Vehicles.createIndexAsync({ searchableFuelType: 1 }, { name: 'searchableFuelTypeIndex' })
  Vehicles.createIndexAsync({ searchableEngine: 1 }, { name: 'searchableEngineIndex' })
  Vehicles.createIndexAsync({ searchableGearbox: 1 }, { name: 'searchableGearboxIndex' })
  Vehicles.createIndexAsync({ searchableDrivetrain: 1 }, { name: 'searchableDrivetrainIndex' })

  Vehicles.createIndexAsync({ createdById: 1 }, { name: 'createdByIdIndex' })
  Vehicles.createIndexAsync({ createdAt: 1 }, { name: 'createdAtIndex' })
  Vehicles.createIndexAsync({ updatedAt: 1 }, { name: 'updatedAtIndex' })
  Vehicles.createIndexAsync({ isActive: 1 }, { name: 'isActiveIndex' })
}

export { Vehicles as default, VehiclesQueue }
