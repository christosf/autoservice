import { Meteor } from 'meteor/meteor'
import { getVehicleList } from '../../api/vehicles/queries'

export function useVehicles() {
    const addVehicle = params => Meteor.callAsync('vehicles.insert', params)
    const fieldValueExists = params => Meteor.callAsync('vehicles.fieldValueExists', params)
    const getDistinctFieldValues = params => Meteor.callAsync('vehicles.getDistinctFieldValues', params)

    return {
        getVehicleList,
        addVehicle,
        fieldValueExists,
        getDistinctFieldValues
    }
}