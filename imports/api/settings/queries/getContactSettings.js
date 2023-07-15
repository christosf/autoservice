import { Settings } from '../../database'

export default Settings.createQuery('getContactSettings', {
    contactTags: 1
})
