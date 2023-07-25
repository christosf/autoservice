import LeftSidebar from '../core/components/LeftSidebar.vue'
import LoginPage from './pages/LoginPage.vue'
import ForgotPassword from './pages/ForgotPassword.vue'
import IndexPage from '../core/pages/IndexPage.vue'

export default [
  {
    name: 'LoginPage',
    path: '/login',
    component: LoginPage,
    meta: {
      access: 'guests-only'
    }
  },
  {
    name: 'ForgotPassword',
    path: '/forgot-password',
    component: ForgotPassword,
    meta: {
      access: 'guests-only'
    }
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
