import { Meteor } from 'meteor/meteor'
import { createApp } from 'vue'
import App from '../../ui/App.vue'
import Quasar from '../../ui/quasar'
import QuasarGreek from '../../ui/quasar-el'
import QuasarConfig from './quasar-config'
import router from './router'
import i18n from './i18n'

Meteor.startup(() => {
    const app = createApp(App)

    app.use(router)
    app.use(i18n)
    app.use(Quasar, QuasarConfig)
    Quasar.lang.set(QuasarGreek)

    app.mount('#app')
})
