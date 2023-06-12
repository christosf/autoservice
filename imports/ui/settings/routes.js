import LeftSidebar from '../core/components/LeftSidebar.vue'
import ExportPage from './pages/ExportPage.vue'

export default [
    {
        path: '/settings',
        children: [
            {
                name: 'SettingsPage',
                path: '',
                redirect: { name: 'ExportPage' }
            },
            {
                name: 'ExportPage',
                path: 'exports',
                components: {
                    default: ExportPage,
                    leftSidebar: LeftSidebar
                }
            }
        ]
    }
]