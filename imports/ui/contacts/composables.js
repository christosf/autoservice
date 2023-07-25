import { Meteor } from 'meteor/meteor'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from '../quasar'
import { useErrorLogAPI } from '../error-log/composables'
import { ContactTypesEnum, ContactMethodsEnum } from '../../api/contacts/enums'

import {
  getContact,
  getContactList,
  getContactEditableFields
} from '../../api/contacts/queries'

export function useContactAPI() {
  const addContact = (params) => Meteor.callAsync('contacts.insert', params)
  const updateContact = (params) => Meteor.callAsync('contacts.update', params)
  const deleteContact = (params) => Meteor.callAsync('contacts.delete', params)
  const activateContact = (params) => Meteor.callAsync('contacts.activate', params)
  const deactivateContact = (params) => Meteor.callAsync('contacts.deactivate', params)
  const updateNotes = (params) => Meteor.callAsync('contacts.updateNotes', params)
  const contactExists = (params) => Meteor.callAsync('contacts.contactExists', params)
  const filterContacts = (params) => Meteor.callAsync('contacts.filterContacts', params)
  const getDistinctFieldValues = (params) => Meteor.callAsync('contacts.getDistinctFieldValues', params)
  const getPrevNextContactCode = (params) => Meteor.callAsync('contacts.getPrevNextContactCode', params)
  const getBasicDetails = (params) => Meteor.callAsync('contacts.getBasicDetails', params)

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
    getPrevNextContactCode,
    getBasicDetails
  }
}

export function useContactFunctions() {
  const router = useRouter()
  const route = useRoute()
  const $q = useQuasar()
  const { t: $t } = useI18n()
  const { insertErrorLog } = useErrorLogAPI()

  const {
    deleteContact: deleteContactFn,
    activateContact: activateContactFn,
    deactivateContact: deactivateContactFn
  } = useContactAPI()

  const isCompany = (type) => type === ContactTypesEnum.COMPANY

  const deleteContact = (contactId) => {
    $q.dialog({
      title: $t('contacts.delete'),
      message: $t('contacts.msg_delete_prompt'),
      persistent: true,
      ok: {
        label: $t('core.delete'),
        color: 'negative',
        icon: 'sym_o_delete',
        noCaps: true
      },
      cancel: {
        color: 'black',
        icon: 'sym_o_cancel',
        flat: true,
        noCaps: true
      }
    }).onOk(() => {
      deleteContactFn({ contactId }).then((response) => {
        const { deleted } = response

        if (deleted) {
          $q.notify({
            type: 'positive',
            message: $t('contacts.msg_delete_successful')
          })
          if (route.name === 'ViewContact') {
            router.push({ name: 'ContactList' })
          }
        } else {
          $q.notify({
            type: 'negative',
            message: $t('core.error_occured')
          })
        }
      }).catch((error) => {
        if (error.error === 'associated-vehicles') {
          $q.notify({
            type: 'negative',
            message: $t('contacts.msg_error_associated_vehicles')
          })
        } else {
          insertErrorLog({
            location: 'deleteContact',
            path: route.fullPath,
            metadata: error
          })
        }
      })
    })
  }

  const activateContact = (contactId) => {
    activateContactFn({ contactId }).then((response) => {
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
    }).catch((error) => {
      insertErrorLog({
        location: 'activateContact',
        path: route.fullPath,
        metadata: error
      })
    })
  }

  const deactivateContact = (contactId) => {
    $q.dialog({
      title: $t('contacts.deactivate'),
      message: $t('contacts.msg_deactivate_prompt'),
      persistent: true,
      ok: {
        label: $t('core.deactivate'),
        color: 'negative',
        icon: 'sym_o_visibility_off',
        noCaps: true
      },
      cancel: {
        color: 'black',
        icon: 'sym_o_cancel',
        flat: true,
        noCaps: true
      }
    }).onOk(() => {
      deactivateContactFn({ contactId }).then((response) => {
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
      }).catch((error) => {
        insertErrorLog({
          location: 'deactivateContact',
          path: route.fullPath,
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

  const contactExists = (name, phoneNumber, msg, excludeId) => new Promise((resolve) => {
    contactExistsFn({
      name,
      phoneNumber,
      excludeId: excludeId || ''
    }).then((exists) => {
      if (exists) {
        resolve(msg)
        return
      }
      resolve(true)
    })
  })

  return {
    contactExists
  }
}
