import { getContactExport } from '../../queries'

getContactExport.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
