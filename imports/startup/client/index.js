import { Meteor } from 'meteor/meteor'
import { createApp } from 'vue'
import App from '../../ui/App.vue'
import Quasar from '../../ui/quasar'
import quasarEl from '../../ui/quasarEl'
import quasarConfig from './quasarConfig'
import router from './router'
import i18n from './i18n'

Meteor.startup(() => {
    const app = createApp(App)

    app.use(router)
    app.use(i18n)
    app.use(Quasar, quasarConfig)
    Quasar.lang.set(quasarEl)

    app.mount('#app')
})
