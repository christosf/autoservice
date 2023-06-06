import { getContactList } from '../../queries'

getContactList.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
