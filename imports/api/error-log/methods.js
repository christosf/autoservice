import { Meteor } from 'meteor/meteor'
import { ErrorLog } from '../database'
import { ErrorLogQueue } from './collection'

Meteor.methods({
    async 'error_log.insert'(errorLog) {
        return await ErrorLogQueue.add(() => ErrorLog.insert(errorLog)).promise
    }
})
