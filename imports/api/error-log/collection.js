import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'
import schema from './schema'

const ErrorLog = new Mongo.Collection('error_log')
const ErrorLogQueue = new Queue()

ErrorLog.attachSchema(schema)

ErrorLog.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

if (Meteor.isServer) {
    // TODO: Add indexes.
}

export { ErrorLog as default, ErrorLogQueue }