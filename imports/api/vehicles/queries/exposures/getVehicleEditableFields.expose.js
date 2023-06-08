import { getVehicleEditableFields } from '../../queries'

getVehicleEditableFields.expose({
    firewall(userId) {
        if (!userId) {
            throw new Meteor.Error('not-allowed')
        }
    }
})
