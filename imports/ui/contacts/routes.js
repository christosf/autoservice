import LeftSidebar from '../core/components/LeftSidebar.vue'
import ContactList from './pages/ContactList.vue'
import ViewContact from './pages/ViewContact.vue'

export default [
    {
        name: 'ContactList',
        path: '/contacts/:view?',
        components: {
            default: ContactList,
            leftSidebar: LeftSidebar
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
            leftSidebar: LeftSidebar
        },
        meta: {
            group: 'Contacts'
        }
    }
]