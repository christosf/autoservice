import { getContactSettings } from '../../queries'

getContactSettings.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
