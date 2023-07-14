import { Meteor } from 'meteor/meteor'

const insertHistoryLog = params => Meteor.call('history_log.insert', params)

export { insertHistoryLog }
