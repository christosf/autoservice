import { getVehicle } from '../../queries'

getVehicle.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
