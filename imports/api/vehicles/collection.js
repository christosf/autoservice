import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Vehicles = new Mongo.Collection('vehicles')

Vehicles.attachSchema(schema)

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

    Vehicles.createIndex({ make: 1 }, { name: 'makeIndex' })

    Vehicles.createIndex({ model: 1 }, { name: 'modelIndex' })

    Vehicles.createIndex({ makeModel: 1 }, { name: 'makeModelIndex' })

    Vehicles.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export default Vehicles
