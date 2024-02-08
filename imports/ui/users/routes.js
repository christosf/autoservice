export default [
  {
    name: 'LoginPage',
    path: '/login',
    components: {
      default: () => import('./pages/LoginPage.vue')
    },
    meta: {
      access: 'guests-only'
    }
  },
  {
    name: 'UserAccount',
    path: '/account',
    components: {
      default: () => import('./pages/UserAccount.vue'),
      sidebar: () => import('../core/components/MainSidebar.vue')
    }
  },
  {
    name: 'ViewUser',
    path: '/users/:username',
    components: {
      default: () => import('./pages/UserAccount.vue'),
      sidebar: () => import('../core/components/MainSidebar.vue')
    }
  }
]
