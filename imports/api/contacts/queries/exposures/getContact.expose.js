import { Meteor } from 'meteor/meteor'
import { getContact } from '../index'

getContact.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
