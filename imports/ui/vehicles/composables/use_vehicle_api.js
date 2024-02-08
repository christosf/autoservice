import { regNumberRegex, chassisNumberRegex } from '../../../api/vehicles/utilities'

import {
  insertVehicle,
  updateVehicle,
  removeVehicle,
  activateVehicle,
  deactivateVehicle,
  updateNotes
} from '../../../api/vehicles/methods'

import {
  fieldValueExistsQuery,
  getDistinctFieldValuesQuery,
  getFilteredVehiclesQuery,
  getVehicleQuery,
  getVehicleCodeQuery,
  getVehicleListQuery,
  getVehicleListByOwnerQuery,
  getVehicleBasicDetailsQuery,
  getVehicleEditableFieldsQuery
} from '../../../api/vehicles/queries'

export default function useVehicleAPI() {
  const fieldValueExists = (params) => fieldValueExistsQuery.clone(params).fetchOneSync()
  const getDistinctFieldValues = (params) => getDistinctFieldValuesQuery.clone(params).fetchSync()
  const getFilteredVehicles = (params) => getFilteredVehiclesQuery.clone(params).fetchSync()
  const getVehicleBasicDetails = (params) => getVehicleBasicDetailsQuery.clone(params).fetchOneSync()
  const getVehicleCode = (params) => getVehicleCodeQuery.clone(params).fetchOneSync()

  return {
    // Constants
    regNumberRegex,
    chassisNumberRegex,
    // Queries
    getVehicleQuery,
    getVehicleListQuery,
    getVehicleListByOwnerQuery,
    getVehicleEditableFieldsQuery,
    // Getters
    fieldValueExists,
    getDistinctFieldValues,
    getFilteredVehicles,
    getVehicleBasicDetails,
    getVehicleCode,
    // Methods
    insertVehicle,
    updateVehicle,
    removeVehicle,
    activateVehicle,
    deactivateVehicle,
    updateNotes
  }
}
