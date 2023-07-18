import { Meteor } from 'meteor/meteor'
import { getContactEditableFields } from '../index'

getContactEditableFields.expose({
  firewall(userId) {
    if (!userId) {
      throw new Meteor.Error('not-allowed')
    }
  }
})
