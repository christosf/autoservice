import { getVehicleList } from '../../queries'

getVehicleList.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
