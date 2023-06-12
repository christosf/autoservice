import merge from 'deepmerge'
import { createI18n } from 'vue-i18n'
import core from '../../ui/core/translations'
import settings from '../../ui/settings/translations'
import users from '../../ui/users/translations'
import contacts from '../../ui/contacts/translations'
import vehicles from '../../ui/vehicles/translations'
import jobcards from '../../ui/job-cards/translations'

const messages = merge.all([
    core,
    settings,
    users,
    contacts,
    vehicles,
    jobcards
])

export default createI18n({
    locale: 'el',
    fallbackLocale: 'en',
    legacy: false,
    messages
})
