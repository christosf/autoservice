import { Meteor } from 'meteor/meteor'

export function useErrorLogAPI() {

    const insertErrorLog = params => Meteor.callAsync('error_log.insert', params)

    return {
        insertErrorLog
    }
}
