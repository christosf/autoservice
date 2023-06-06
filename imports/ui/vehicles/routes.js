import LeftSidebar from '../core/components/LeftSidebar.vue'
import VehicleList from './pages/VehicleList.vue'
import ViewVehicle from './pages/ViewVehicle.vue'

export default [
    {
        path: '/vehicles',
        children: [
            {
                name: 'VehicleList',
                path: '',
                components: {
                    default: VehicleList,
                    leftSidebar: LeftSidebar
                }
            },
            {
                name: 'ViewVehicle',
                path: ':code',
                components: {
                    default: ViewVehicle,
                    leftSidebar: LeftSidebar
                }
            }
        ]
    }
]