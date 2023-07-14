import { Meteor } from 'meteor/meteor'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../quasar'
import { useErrorLogAPI } from '../error-log/composables'

import {
    getVehicle,
    getVehicleList,
    getVehicleEditableFields
} from '../../api/vehicles/queries'

export function useVehicleAPI() {
    const addVehicle = params => Meteor.callAsync('vehicles.insert', params)
    const updateVehicle = params => Meteor.callAsync('vehicles.update', params)
    const deleteVehicle = params => Meteor.callAsync('vehicles.delete', params)
    const activateVehicle = params => Meteor.callAsync('vehicles.activate', params)
    const deactivateVehicle = params => Meteor.callAsync('vehicles.deactivate', params)
    const updateNotes = params => Meteor.callAsync('vehicles.updateNotes', params)
    const fieldValueExists = params => Meteor.callAsync('vehicles.fieldValueExists', params)
    const getDistinctFieldValues = params => Meteor.callAsync('vehicles.getDistinctFieldValues', params)
    const getBasicDetails = params => Meteor.callAsync('vehicles.getBasicDetails', params)

    return {
        // Queries
        getVehicle,
        getVehicleList,
        getVehicleEditableFields,
        // Methods
        addVehicle,
        updateVehicle,
        deleteVehicle,
        activateVehicle,
        deactivateVehicle,
        updateNotes,
        fieldValueExists,
        getDistinctFieldValues,
        getBasicDetails
    }
}

export function useVehicleFunctions() {
    const $q = useQuasar()
    const { t: $t } = useI18n()
    const { insertErrorLog } = useErrorLogAPI()

    const regNumberRegex = /^$|^[a-zA-Z0-9]{4,10}$/
    const chassisNumberRegex = /^$|^[a-zA-Z0-9]{17}$/

    const {
        deleteVehicle: deleteVehicleFn,
        activateVehicle: activateVehicleFn,
        deactivateVehicle: deactivateVehicleFn
    } = useVehicleAPI()

    const deleteVehicle = _id => {
        $q.dialog({
            title: $t('vehicles.delete'),
            message: $t('vehicles.msg_delete_prompt'),
            cancel: true,
            persistent: true,
            ok: {
                label: $t('core.delete'),
                color: 'negative',
                icon: 'delete',
                noCaps: true
            },
            cancel: {
                color: 'black',
                icon: 'cancel',
                flat: true,
                noCaps: true
            }
        }).onOk(() => {
            deleteVehicleFn({ _id }).then(response => {
                const { deleted } = response

                if (deleted) {
                    $q.notify({
                        type: 'positive',
                        message: $t('vehicles.msg_delete_successful')
                    })
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
            }).catch(error => {
                insertErrorLog({
                    location: 'deleteVehicle',
                    path: router.currentRoute.value.fullPath,
                    metadata: error
                })
            })
        })
    }

    const activateVehicle = _id => {
        activateVehicleFn({ _id }).then(response => {
            const { activated } = response

            if (activated) {
                $q.notify({
                    type: 'positive',
                    message: $t('vehicles.msg_activate_successful')
                })
            } else {
                $q.notify({
                    type: 'negative',
                    message: $t('core.error_occured')
                })
            }
        }).catch(error => {
            insertErrorLog({
                location: 'activateVehicle',
                path: router.currentRoute.value.fullPath,
                metadata: error
            })
        })
    }

    const deactivateVehicle = _id => {
        $q.dialog({
            title: $t('vehicles.deactivate'),
            message: $t('vehicles.msg_deactivate_prompt'),
            cancel: true,
            persistent: true,
            ok: {
                label: $t('core.deactivate'),
                color: 'negative',
                icon: 'visibility_off',
                noCaps: true
            },
            cancel: {
                color: 'black',
                icon: 'cancel',
                flat: true,
                noCaps: true
            }
        }).onOk(() => {
            deactivateVehicleFn({ _id }).then(response => {
                const { deactivated } = response

                if (deactivated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('vehicles.msg_deactivate_successful')
                    })
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
            }).catch(error => {
                insertErrorLog({
                    location: 'deactivateVehicle',
                    path: router.currentRoute.value.fullPath,
                    metadata: error
                })
            })
        })
    }

    return {
        regNumberRegex,
        chassisNumberRegex,
        deleteVehicle,
        activateVehicle,
        deactivateVehicle
    }
}

export function useVehicleRules() {
    const { fieldValueExists: fieldValueExistsFn } = useVehicleAPI()
    const { regNumberRegex, chassisNumberRegex } = useVehicleFunctions()

    const regNumber = (value, msg) => regNumberRegex.test(value) || msg

    const chassisNumber = (value, msg) => chassisNumberRegex.test(value) || msg

    const fieldValueExists = (value, field, msg, excludeId) => {
        return new Promise(resolve => {
            fieldValueExistsFn({
                field,
                value,
                excludeId: excludeId ? excludeId : ''
            }).then(exists => {
                if (exists) {
                    resolve(msg)
                    return
                }
                resolve(true)
            })
        })
    }
    
    return {
        regNumber,
        chassisNumber,
        fieldValueExists
    }
}
