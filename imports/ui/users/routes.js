import LeftSidebar from '../core/components/LeftSidebar.vue'
import LoginPage from './pages/LoginPage.vue'
import IndexPage from '../core/pages/IndexPage.vue'

export default [
    {
        name: 'LoginPage',
        path: '/login',
        component: LoginPage
    },
    {
        name: 'ViewUser',
        path: '/users/:username',
        components: {
            default: IndexPage,
            leftSidebar: LeftSidebar
        }
    }
]
