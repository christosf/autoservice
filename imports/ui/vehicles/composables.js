import { Meteor } from 'meteor/meteor'
import { getVehicle, getVehicleList, getVehicleEditableFields } from '../../api/vehicles/queries'

export function useVehiclesApi() {
    const addVehicle = params => Meteor.callAsync('vehicles.insert', params)
    const updateVehicle = params => Meteor.callAsync('vehicles.update', params)
    const deleteVehicle = params => Meteor.callAsync('vehicles.delete', params)
    const activateVehicle = params => Meteor.callAsync('vehicles.activate', params)
    const deactivateVehicle = params => Meteor.callAsync('vehicles.deactivate', params)
    const fieldValueExists = params => Meteor.callAsync('vehicles.fieldValueExists', params)
    const getDistinctFieldValues = params => Meteor.callAsync('vehicles.getDistinctFieldValues', params)

    return {
        getVehicle,
        getVehicleList,
        getVehicleEditableFields,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        activateVehicle,
        deactivateVehicle,
        fieldValueExists,
        getDistinctFieldValues
    }
}