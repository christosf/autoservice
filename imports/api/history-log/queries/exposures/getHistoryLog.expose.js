import { getHistoryLog } from '../../queries'

getHistoryLog.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
