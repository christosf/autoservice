import { getServiceEditableFields } from '../../queries'

getServiceEditableFields.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
