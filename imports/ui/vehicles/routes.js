import LeftSidebar from '../core/components/LeftSidebar.vue'
import VehicleList from './pages/VehicleList.vue'
import ViewVehicle from './pages/ViewVehicle.vue'

export default [
    {
        name: 'VehicleList',
        path: '/vehicles/:view?',
        components: {
            default: VehicleList,
            leftSidebar: LeftSidebar
        },
        meta: {
            group: 'Vehicles'
        }
    },
    {
        name: 'ViewVehicle',
        path: '/vehicle/:code/:view?',
        components: {
            default: ViewVehicle,
            leftSidebar: LeftSidebar
        },
        meta: {
            group: 'Vehicles'
        }
    }
]