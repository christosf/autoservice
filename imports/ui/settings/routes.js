import LeftSidebar from '../core/components/LeftSidebar.vue'
import SettingsPage from './pages/SettingsPage.vue'
import ExportPage from './pages/ExportPage.vue'

export default [
  {
    path: '/settings',
    children: [
      {
        name: 'SettingsPage',
        path: '',
        components: {
          default: SettingsPage,
          leftSidebar: LeftSidebar
        },
        meta: {
          group: 'Settings'
        }
      },
      {
        name: 'ExportPage',
        path: 'exports',
        components: {
          default: ExportPage,
          leftSidebar: LeftSidebar
        },
        meta: {
          group: 'Settings'
        }
      }
    ]
  }
]
