import { Meteor } from 'meteor/meteor'
import { getContactExport } from '../contacts/queries'

Meteor.methods({
    'settings.exportContacts'() {
        return getContactExport.clone().fetch()
    }
})
