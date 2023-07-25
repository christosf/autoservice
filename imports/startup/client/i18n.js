import { createI18n } from 'vue-i18n'
import merge from 'deepmerge'

import core from '../../ui/core/translations'
import settings from '../../ui/settings/translations'
import historyLog from '../../ui/history-log/translations'
import users from '../../ui/users/translations'
import contacts from '../../ui/contacts/translations'
import vehicles from '../../ui/vehicles/translations'
import services from '../../ui/services/translations'
import jobcards from '../../ui/job-cards/translations'

const messages = merge.all([
  core,
  settings,
  historyLog,
  users,
  contacts,
  vehicles,
  services,
  jobcards
])

export default createI18n({
  locale: 'el',
  fallbackLocale: 'en',
  legacy: false,
  messages
})
