import { Meteor } from 'meteor/meteor'
import { getContactList } from '../index'

getContactList.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
