import { createI18n } from 'vue-i18n'

import coreEL from '../../locales/el/core.json'
import coreEN from '../../locales/en/core.json'
import historyLogEL from '../../locales/el/history_log.json'
import historyLogEN from '../../locales/en/history_log.json'
import usersEL from '../../locales/el/users.json'
import usersEN from '../../locales/en/users.json'
import contactsEL from '../../locales/el/contacts.json'
import contactsEN from '../../locales/en/contacts.json'
import vehiclesEL from '../../locales/el/vehicles.json'
import vehiclesEN from '../../locales/en/vehicles.json'
import jobCardsEL from '../../locales/el/job_cards.json'
import jobCardsEN from '../../locales/en/job_cards.json'

const translations = {
  el: {
    core: coreEL,
    history_log: historyLogEL,
    users: usersEL,
    contacts: contactsEL,
    vehicles: vehiclesEL,
    job_cards: jobCardsEL
  },
  en: {
    core: coreEN,
    history_log: historyLogEN,
    users: usersEN,
    contacts: contactsEN,
    vehicles: vehiclesEN,
    job_cards: jobCardsEN
  }
}

const i18n = createI18n({
  locale: 'el',
  fallbackLocale: 'en',
  legacy: false,
  messages: translations
})

export default i18n
