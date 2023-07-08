import { Meteor } from 'meteor/meteor'
import { HistoryLog } from '../database'
import { HistoryLogQueue } from './collection'

Meteor.methods({
    async 'history_log.insert'(historyLog) {
        return await HistoryLogQueue.add(() => HistoryLog.insert(historyLog)).promise
    }
})
