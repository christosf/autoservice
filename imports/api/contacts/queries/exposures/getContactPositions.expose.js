import { Meteor } from 'meteor/meteor'
import { getContactPositions } from '../index'

getContactPositions.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
