import { Settings } from '../../database'

const getSettingsQuery = Settings.createQuery('settings:get_settings', {
  version: 1,
  companyName: 1
})

export default getSettingsQuery
