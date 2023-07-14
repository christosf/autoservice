import { Meteor } from 'meteor/meteor'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../quasar'
import { ContactTypesEnum, ContactMethodsEnum } from '../../api/contacts/enums'
import { useErrorLogAPI } from '../error-log/composables'

import {
    getContact,
    getContactList,
    getContactEditableFields
} from '../../api/contacts/queries'

export function useContactAPI() {
    const addContact = params => Meteor.callAsync('contacts.insert', params)
    const updateContact = params => Meteor.callAsync('contacts.update', params)
    const deleteContact = params => Meteor.callAsync('contacts.delete', params)
    const activateContact = params => Meteor.callAsync('contacts.activate', params)
    const deactivateContact = params => Meteor.callAsync('contacts.deactivate', params)
    const updateNotes = params => Meteor.callAsync('contacts.updateNotes', params)
    const contactExists = params => Meteor.callAsync('contacts.contactExists', params)
    const filterContacts = params => Meteor.callAsync('contacts.filterContacts', params)
    const getDistinctFieldValues = params => Meteor.callAsync('contacts.getDistinctFieldValues', params)
    const getBasicDetails = params => Meteor.callAsync('contacts.getBasicDetails', params)
    
    return {
        // Enums
        ContactTypesEnum,
        ContactMethodsEnum,
        // Queries
        getContact,
        getContactList,
        getContactEditableFields,
        // Methods
        addContact,
        updateContact,
        deleteContact,
        activateContact,
        deactivateContact,
        updateNotes,
        contactExists,
        filterContacts,
        getDistinctFieldValues,
        getBasicDetails
    }
}

export function useContactFunctions() {
    const $q = useQuasar()
    const { t: $t } = useI18n()
    const { insertErrorLog } = useErrorLogAPI()

    const {
        deleteContact: deleteContactFn,
        activateContact: activateContactFn,
        deactivateContact: deactivateContactFn
    } = useContactAPI()

    const isCompany = type => type === ContactTypesEnum.COMPANY

    const deleteContact = _id => {
        $q.dialog({
            title: $t('contacts.delete'),
            message: $t('contacts.msg_delete_prompt'),
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
            deleteContactFn({ _id }).then(response => {
                const { deleted } = response

                if (deleted) {
                    $q.notify({
                        type: 'positive',
                        message: $t('contacts.msg_delete_successful')
                    })
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
            }).catch(error => {
                if (error.error === 'vehicles-associated') {
                    $q.notify({
                        type: 'negative',
                        message: $t('contacts.msg_error_associated_vehicles')
                    })
                } else {
                    insertErrorLog({
                        location: 'deleteContact',
                        path: router.currentRoute.value.fullPath,
                        metadata: error
                    })
                }
            })
        })
    }

    const activateContact = _id => {
        activateContactFn({ _id }).then(response => {
            const { activated } = response

            if (activated) {
                $q.notify({
                    type: 'positive',
                    message: $t('contacts.msg_activate_successful')
                })
            } else {
                $q.notify({
                    type: 'negative',
                    message: $t('core.error_occured')
                })
            }
        }).catch(error => {
            insertErrorLog({
                location: 'activateContact',
                path: router.currentRoute.value.fullPath,
                metadata: error
            })
        })
    }

    const deactivateContact = _id => {
        $q.dialog({
            title: $t('contacts.deactivate'),
            message: $t('contacts.msg_deactivate_prompt'),
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
            deactivateContactFn({ _id }).then(response => {
                const { deactivated } = response

                if (deactivated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('contacts.msg_deactivate_successful')
                    })
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
            }).catch(error => {
                insertErrorLog({
                    location: 'deactivateContact',
                    path: router.currentRoute.value.fullPath,
                    metadata: error
                })
            })
        })
    }

    return {
        isCompany,
        deleteContact,
        activateContact,
        deactivateContact
    }
}

export function useContactRules() {
    const { contactExists: contactExistsFn } = useContactAPI()

    const contactExists = (name, phoneNumber, msg, excludeId) => {
        return new Promise(resolve => {
            contactExistsFn({
                name,
                phoneNumber,
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
        contactExists
    }
}