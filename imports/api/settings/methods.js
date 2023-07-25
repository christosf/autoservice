import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import SimpleSchema from 'simpl-schema'
import Settings from './collection'

Meteor.methods({
  'settings.updateGeneral'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      settingsId: String,
      settings: {
        type: Object,
        blackbox: true
      }
    })
    schema.validate(schema.clean(params))

    const { settingsId, settings } = params

    return { updated: Settings.update(settingsId, { $set: settings }) === 1 }
  }
})
