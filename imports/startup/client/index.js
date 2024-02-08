import { Meteor } from 'meteor/meteor'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { passiveSupport } from 'passive-events-support/src/utils'
import { Quasar, Dialog, Notify, LocalStorage } from '../../ui/quasar'

// @ts-ignore
import App from '../../ui/App.vue'
import router from './router'
import i18n from './i18n'
import quasarEL from '../../locales/quasar_el'

import '../both'

Meteor.startup(() => {
  const app = createApp(App)
  const store = createPinia()

  app.use(router)
  app.use(i18n)
  app.use(store)

  app.use(Quasar, {
    lang: quasarEL,
    plugins: [
      Dialog,
      Notify,
      LocalStorage
    ],
    config: {
      brand: {
        primary: '#e64a19',
        secondary: '#607d8b'
      },
      screen: {
        bodyClasses: true
      },
      loadingBar: {
        skipHijack: true
      }
    }
  })

  passiveSupport({
    listeners: [
      {
        element: '.q-btn',
        event: 'touchstart'
      },
      {
        element: '.q-tabs',
        event: 'touchstart'
      },
      {
        element: '.q-table__container',
        event: 'touchstart'
      }
    ]
  })

  app.mount('#app')
})
