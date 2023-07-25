import { Meteor } from 'meteor/meteor'
import { getGeneralSettings } from '../../api/settings/queries'

export function useSettingAPI() {
  const updateGeneralSettings = (params) => Meteor.callAsync('settings.updateGeneral', params)
  const getExportedContacts = () => Meteor.callAsync('settings.exportContacts')

  return {
    getGeneralSettings,
    updateGeneralSettings,
    getExportedContacts
  }
}
