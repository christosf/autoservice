import LeftSidebar from '../core/components/LeftSidebar.vue'
import ServiceList from './pages/ServiceList.vue'

export default [
    {
        path: '/services',
        children: [
            {
                name: 'ServiceList',
                path: '',
                components: {
                    default: ServiceList,
                    leftSidebar: LeftSidebar
                }
            }
        ]
    }
]
