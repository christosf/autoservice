import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVehicleStore = defineStore('vehicles', () => {
  const vehicleToProvide = ref(null)

  const providedVehicle = computed(() => vehicleToProvide.value)

  const setProvidedVehicle = ({ vehicle }) => {
    vehicleToProvide.value = vehicle
  }

  const clearProvidedVehicle = () => {
    vehicleToProvide.value = null
  }

  return {
    providedVehicle,
    setProvidedVehicle,
    clearProvidedVehicle
  }
})
