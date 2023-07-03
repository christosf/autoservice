import { Meteor } from 'meteor/meteor'
import { ErrorLog } from '../database'
import { ErrorLogQueue } from './collection'
import { CounterNamesEnum } from '../counters/enums'

Meteor.methods({
    async 'error_log.insert'(params) {
        return await ErrorLogQueue.add(() => {
            const errorLog = { ...params }
            errorLog.code = Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.ERROR_LOG })

            return { added: true, _id: ErrorLog.insert(errorLog), code: errorLog.code }
        }).promise
    }
})
