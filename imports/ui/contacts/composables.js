import { Meteor } from 'meteor/meteor'
import { ContactTypesEnum, ContactMethodsEnum } from '../../api/contacts/enums'
import { getContact, getContactList, getContactEditableFields } from '../../api/contacts/queries'

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
        getDistinctFieldValues
    }
}

export function useContactFunctions() {
    const isCompany = type => type === ContactTypesEnum.COMPANY

    return {
        isCompany
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
            }).then(response => {
                if (response) {
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