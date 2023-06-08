import merge from 'deepmerge'
import { createI18n } from 'vue-i18n'
import core from '../../ui/core/translations'
import users from '../../ui/users/translations'
import contacts from '../../ui/contacts/translations'
import vehicles from '../../ui/vehicles/translations'
import jobcards from '../../ui/jobcards/translations'

const messages = merge.all([
    core,
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
