import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'
import schema from './schema'

const HistoryLog = new Mongo.Collection('history_log')
const HistoryLogQueue = new Queue()

HistoryLog.attachSchema(schema)

HistoryLog.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

if (Meteor.isServer) {
    HistoryLog.createIndex({ contactId: 1 }, { name: 'contactIdIndex' })

    HistoryLog.createIndex({ createdAt: 1 }, { name: 'createdAtIndex' })
}

export { HistoryLog as default, HistoryLogQueue }
