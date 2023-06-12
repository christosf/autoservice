import { Meteor } from 'meteor/meteor'
import { getContactExport } from '../contacts/queries'

Meteor.methods({
    'settings.exportContacts'() {
        if (Meteor.isClient) return

        return getContactExport.clone().fetch()
    }
})
