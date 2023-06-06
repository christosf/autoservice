import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Counters = new Mongo.Collection('counters')

Counters.attachSchema(schema)

Counters.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
})

if (Meteor.isServer) {
    Counters.createIndex({ name: 1 }, {
        name: 'nameIndex',
        unique: true
    })
}

export default Counters
