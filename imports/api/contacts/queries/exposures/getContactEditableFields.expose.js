import { getContactEditableFields } from '../../queries'

getContactEditableFields.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
