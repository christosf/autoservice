import { Meteor } from 'meteor/meteor'
import { getServiceList, getServiceEditableFields } from '../../api/services/queries'

export function useServicesApi() {
    const addService = params => Meteor.callAsync('services.insert', params)
    const updateService = params => Meteor.callAsync('services.update', params)
    const deleteService = params => Meteor.callAsync('services.delete', params)
    const activateService = params => Meteor.callAsync('services.activate', params)
    const deactivateService = params => Meteor.callAsync('services.deactivate', params)
    const serviceExists = params => Meteor.callAsync('services.serviceExists', params)
    const getDistinctFieldValues = params => Meteor.callAsync('services.getDistinctFieldValues', params)

    return {
        getServiceList,
        getServiceEditableFields,
        addService,
        updateService,
        deleteService,
        activateService,
        deactivateService,
        serviceExists,
        getDistinctFieldValues
    }
}