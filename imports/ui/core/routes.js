import LeftSidebar from './components/LeftSidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import IndexPage from './pages/IndexPage.vue'
import NotFound from './pages/NotFound.vue'

export default [
    {
        name: 'IndexPage',
        path: '/',
        components: {
            default: IndexPage,
            leftSidebar: LeftSidebar,
            // rightSidebar: RightSidebar
        }
    },
    {
        name: 'NotFound',
        path: '/:pathMatch(.*)*',
        components: {
            default: NotFound
        }
    }
]
