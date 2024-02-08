export default [
  {
    name: 'IndexPage',
    path: '/',
    components: {
      default: () => import('./pages/IndexPage.vue'),
      sidebar: () => import('./components/MainSidebar.vue')
    }
  },
  {
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
    components: {
      default: () => import('./pages/NotFound.vue'),
      sidebar: () => import('./components/MainSidebar.vue')
    }
  }
]
