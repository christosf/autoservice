import { ContactTypesEnum, ContactMethodTypesEnum } from '../../../api/contacts/enums'

import {
  insertContact,
  updateContact,
  removeContact,
  activateContact,
  deactivateContact,
  updateNotes
} from '../../../api/contacts/methods'

import {
  contactExistsQuery,
  getDistinctFieldValuesQuery,
  getFilteredContactsQuery,
  getContactQuery,
  getContactCodeQuery,
  getContactListQuery,
  getContactBasicDetailsQuery,
  getContactEditableFieldsQuery
} from '../../../api/contacts/queries'

export default function useContactAPI() {
  const contactExists = (params) => contactExistsQuery.clone(params).fetchOneSync()
  const getDistinctFieldValues = (params) => getDistinctFieldValuesQuery.clone(params).fetchSync()
  const getFilteredContacts = (params) => getFilteredContactsQuery.clone(params).fetchSync()
  const getContactBasicDetails = (params) => getContactBasicDetailsQuery.clone(params).fetchOneSync()
  const getContactCode = (params) => getContactCodeQuery.clone(params).fetchOneSync()

  return {
    // Enums
    ContactTypesEnum,
    ContactMethodTypesEnum,
    // Queries
    getContactQuery,
    getContactListQuery,
    getContactEditableFieldsQuery,
    // Getters
    contactExists,
    getDistinctFieldValues,
    getFilteredContacts,
    getContactBasicDetails,
    getContactCode,
    // Methods
    insertContact,
    updateContact,
    removeContact,
    activateContact,
    deactivateContact,
    updateNotes
  }
}
