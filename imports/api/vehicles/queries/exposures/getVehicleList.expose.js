import { Meteor } from 'meteor/meteor'
import { getVehicleList } from '../index'

getVehicleList.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
