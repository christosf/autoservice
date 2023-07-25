import { Meteor } from 'meteor/meteor'
import { getVehicleEditableFields } from '../index'

getVehicleEditableFields.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
