import { Meteor } from 'meteor/meteor'
import { getContactSettings } from '../../api/settings/queries'

export function useSettingAPI() {
    const getExportedContacts = () => Meteor.callAsync('settings.exportContacts')

    return {
        getContactSettings,
        getExportedContacts
    }
}
