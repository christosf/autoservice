import { Meteor } from 'meteor/meteor'

export function useSettingsApi() {
    const getExportedContacts = () => Meteor.callAsync('settings.exportContacts')

    return {
        getExportedContacts
    }
}
