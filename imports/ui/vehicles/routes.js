import MainSidebar from '../core/components/MainSidebar.vue'
import VehicleList from './pages/VehicleList.vue'
import ViewVehicle from './pages/ViewVehicle.vue'

export default [
  {
    name: 'VehicleList',
    path: '/vehicles/:view?',
    components: {
      default: VehicleList,
      sidebar: MainSidebar
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
      sidebar: MainSidebar
    },
    meta: {
      group: 'Vehicles'
    }
  }
]
