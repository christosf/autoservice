import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import baseSchema from '../core/schemas/base-schema'
import vehicleSchema from './schema'
import tagsSchema from '../core/schemas/tags-schema'

const Vehicles = new Mongo.Collection('vehicles')
const VehiclesQueue = new Queue()

Vehicles.attachSchema(baseSchema)
Vehicles.attachSchema(vehicleSchema)
Vehicles.attachSchema(tagsSchema)

Vehicles.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

if (Meteor.isServer) {
    Vehicles.createIndex({ code: 1 }, {
        name: 'codeIndex',
        unique: true
    })

    Vehicles.createIndex({ regNumber: 1 }, {
        name: 'regNumberIndex',
        unique: true,
        sparse: true
    })

    Vehicles.createIndex({ chassisNumber: 1 }, {
        name: 'chassisNumberIndex',
        unique: true,
        sparse: true
    })

    Vehicles.createIndex({ searchableMake: 1 }, { name: 'searchableMakeIndex' })

    Vehicles.createIndex({ searchableModel: 1 }, { name: 'searchableModelIndex' })

    Vehicles.createIndex({ searchableMakeModel: 1 }, { name: 'searchableMakeModelIndex' })

    Vehicles.createIndex({ searchableTags: 1 }, {
        name: 'searchableTagsIndex',
        sparse: true
    })

    Vehicles.createIndex({ searchableBodyType: 1 }, { name: 'searchableBodyTypeIndex' })

    Vehicles.createIndex({ searchableFuelType: 1 }, { name: 'searchableFuelTypeIndex' })
    
    Vehicles.createIndex({ searchableEngine: 1 }, { name: 'searchableEngineIndex' })
    
    Vehicles.createIndex({ searchableGearbox: 1 }, { name: 'searchableGearboxIndex' })
    
    Vehicles.createIndex({ searchableDrivetrain: 1 }, { name: 'searchableDrivetrainIndex' })

    Vehicles.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export { Vehicles as default, VehiclesQueue }
