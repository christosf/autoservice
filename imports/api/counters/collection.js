import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Counters = new Mongo.Collection('counters', { defineMutationMethods: false })

Counters.attachSchema(schema)

if (Meteor.isServer) {
  Counters.createIndexAsync({ name: 1 }, {
    name: 'nameIndex',
    unique: true
  })
}

export default Counters
