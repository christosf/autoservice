import { Meteor } from 'meteor/meteor'

const checkLoggedIn = function() {
  if (!this.userId) {
    throw new Meteor.Error('not-allowed')
  }
}

export {
  checkLoggedIn
}
