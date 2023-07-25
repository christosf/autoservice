import { Settings } from '../../database'

export default Settings.createQuery('getGeneralSettings', {
  companyName: 1,
  companyNameShort: 1
})
