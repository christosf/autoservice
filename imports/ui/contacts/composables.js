import { Meteor } from 'meteor/meteor'
import { useI18n } from 'vue-i18n'
import { ContactTypesEnum, AddressTypesEnum } from '../../api/contacts/enums'
import { getContact, getContactList, getContactEditableFields } from '../../api/contacts/queries'

export function useContactsApi() {
    const addContact = params => Meteor.callAsync('contacts.insert', params)
    const updateContact = params => Meteor.callAsync('contacts.update', params)
    const deleteContact = params => Meteor.callAsync('contacts.delete', params)
    const activateContact = params => Meteor.callAsync('contacts.activate', params)
    const deactivateContact = params => Meteor.callAsync('contacts.deactivate', params)
    const contactExists = params => Meteor.callAsync('contacts.contactExists', params)
    const filterContacts = params => Meteor.callAsync('contacts.filterContacts', params)
    const getDistinctFieldValues = params => Meteor.callAsync('contacts.getDistinctFieldValues', params)
    
    return {
        ContactTypesEnum,
        AddressTypesEnum,
        getContact,
        getContactList,
        getContactEditableFields,
        addContact,
        updateContact,
        deleteContact,
        activateContact,
        deactivateContact,
        contactExists,
        filterContacts,
        getDistinctFieldValues
    }
}

export function useContactsReusables() {
    const { t: $t } = useI18n()

    const addressesFieldColumns = [
        {
            name: 'index',
            label: '#',
            align: 'center'
        },
        {
            name: 'street',
            label: $t('contacts.address_street'),
            field: 'street',
            align: 'left'
        },
        {
            name: 'city',
            label: $t('contacts.address_city'),
            field: 'city',
            align: 'left'
        },
        {
            name: 'postalCode',
            label: $t('contacts.address_postal_code'),
            field: 'postalCode',
            align: 'left'
        },
        {
            name: 'type',
            label: $t('core.type'),
            field: 'type',
            align: 'left'
        }
    ]
    
    const addressTypeOptionList = [
        {
            label: '',
            value: ''
        },
        {
            label: $t('contacts.address_type_invoice'),
            value: AddressTypesEnum.INVOICE
        },
        {
            label: $t('contacts.address_type_delivery'),
            value: AddressTypesEnum.DELIVERY
        },
        {
            label: $t('contacts.address_type_private'),
            value: AddressTypesEnum.PRIVATE
        },
        {
            label: $t('contacts.address_type_other'),
            value: AddressTypesEnum.OTHER
        },
    ]

    return {
        addressesFieldColumns,
        addressTypeOptionList
    }
}