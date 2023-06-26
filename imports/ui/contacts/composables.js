import { Meteor } from 'meteor/meteor'
import { useI18n } from 'vue-i18n'
import { ContactTypesEnum } from '../../api/contacts/enums'
import { getContact, getContactList, getContactEditableFields } from '../../api/contacts/queries'

export function useContactsApi() {
    const addContact = params => Meteor.callAsync('contacts.insert', params)
    const updateContact = params => Meteor.callAsync('contacts.update', params)
    const deleteContact = params => Meteor.callAsync('contacts.delete', params)
    const activateContact = params => Meteor.callAsync('contacts.activate', params)
    const deactivateContact = params => Meteor.callAsync('contacts.deactivate', params)
    const updateNotes = params => Meteor.callAsync('contacts.updateNotes', params)
    const contactExists = params => Meteor.callAsync('contacts.contactExists', params)
    const filterContacts = params => Meteor.callAsync('contacts.filterContacts', params)
    const getDistinctFieldValues = params => Meteor.callAsync('contacts.getDistinctFieldValues', params)
    
    return {
        ContactTypesEnum,
        getContact,
        getContactList,
        getContactEditableFields,
        addContact,
        updateContact,
        deleteContact,
        activateContact,
        deactivateContact,
        updateNotes,
        contactExists,
        filterContacts,
        getDistinctFieldValues
    }
}

export function useContactsReusables() {

    return {
        
    }
}