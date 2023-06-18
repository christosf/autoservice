import { getServiceList } from '../../queries'

getServiceList.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
