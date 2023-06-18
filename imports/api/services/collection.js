import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Services = new Mongo.Collection('services')

Services.attachSchema(schema)

Services.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
})

if (Meteor.isServer) {
    Services.createIndex({ code: 1 }, {
        name: 'codeIndex',
        unique: true
    })

    Services.createIndex({ name: 1 }, {
        name: 'nameIndex',
        unique: true
    })

    Services.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export default Services
