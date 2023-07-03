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
    ErrorLog.createIndex({ code: 1 }, {
        name: 'codeIndex',
        unique: true
    })
    // TODO: Add more indexes.
}

export { ErrorLog as default, ErrorLogQueue }