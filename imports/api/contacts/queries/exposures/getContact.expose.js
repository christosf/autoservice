import { getContact } from '../../queries'

getContact.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
