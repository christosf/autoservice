import MainSidebar from '../core/components/MainSidebar.vue'
import JobCardList from './pages/JobCardList.vue'
import ViewJobCard from './pages/ViewJobCard.vue'

export default [
  {
    name: 'JobCardList',
    path: '/job-cards/:view?',
    components: {
      default: JobCardList,
      sidebar: MainSidebar
    },
    meta: {
      group: 'JobCards'
    }
  },
  {
    name: 'ViewJobCard',
    path: '/job-card/:code/:view?',
    components: {
      default: ViewJobCard,
      sidebar: MainSidebar
    },
    meta: {
      group: 'JobCards'
    }
  }
]
