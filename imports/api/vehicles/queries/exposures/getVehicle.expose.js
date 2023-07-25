import { Meteor } from 'meteor/meteor'
import { getVehicle } from '../index'

getVehicle.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
