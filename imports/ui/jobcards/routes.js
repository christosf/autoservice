import LeftSidebar from '../core/components/LeftSidebar.vue'
import JobcardList from './pages/JobcardList.vue'
import ViewJobcard from './pages/ViewJobcard.vue'

export default [
    {
        path: '/jobcards',
        children: [
            {
                name: 'JobcardList',
                path: '',
                components: {
                    default: JobcardList,
                    leftSidebar: LeftSidebar
                }
            },
            {
                name: 'ViewJobcard',
                path: ':code',
                components: {
                    default: ViewJobcard,
                    leftSidebar: LeftSidebar
                }
            }
        ]
    }
]