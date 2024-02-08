import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'
import historyLogSchema from './schema'

const HistoryLog = new Mongo.Collection('history_log', { defineMutationMethods: false })
const HistoryLogQueue = new Queue()

HistoryLog.attachSchema(historyLogSchema)

if (Meteor.isServer) {
  HistoryLog.createIndexAsync({ type: 1 }, { name: 'typeIndex' })
  HistoryLog.createIndexAsync({ contactId: 1 }, { name: 'contactIdIndex', sparse: true })
  HistoryLog.createIndexAsync({ vehicleId: 1 }, { name: 'vehicleIdIndex', sparse: true })
}

export { HistoryLog as default, HistoryLogQueue }
