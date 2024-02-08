import MainSidebar from '../core/components/MainSidebar.vue'
import ContactList from './pages/ContactList.vue'
import ViewContact from './pages/ViewContact.vue'

export default [
  {
    name: 'ContactList',
    path: '/contacts/:view?',
    components: {
      default: ContactList,
      sidebar: MainSidebar
    },
    meta: {
      group: 'Contacts'
    }
  },
  {
    name: 'ViewContact',
    path: '/contact/:code/:view?',
    components: {
      default: ViewContact,
      sidebar: MainSidebar
    },
    meta: {
      group: 'Contacts'
    }
  }
]
