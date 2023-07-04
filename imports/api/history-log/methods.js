import { Meteor } from 'meteor/meteor'
import { HistoryLog } from '../database'
import { HistoryLogQueue } from './collection'

Meteor.methods({
    async 'history_log.insert'(params) {
        return await HistoryLogQueue.add(() => {
            const historyLog = { ...params }

            return HistoryLog.insert(historyLog)
        }).promise
    }
})
