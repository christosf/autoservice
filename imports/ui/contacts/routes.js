import LeftSidebar from '../core/components/LeftSidebar.vue'
import ContactList from './pages/ContactList.vue'
import ViewContact from './pages/ViewContact.vue'

export default [
    {
        path: '/contacts',
        children: [
            {
                name: 'ContactList',
                path: '',
                components: {
                    default: ContactList,
                    leftSidebar: LeftSidebar
                }
            },
            {
                name: 'ViewContact',
                path: ':code',
                components: {
                    default: ViewContact,
                    leftSidebar: LeftSidebar
                }
            }
        ]
    }
]