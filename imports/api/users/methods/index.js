import { Meteor } from 'meteor/meteor'

import changeLanguage from './change_language'

Meteor.methods({
  'users:change_language': changeLanguage
})
