import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Contacts } from '../database'
import { ContactsQueue } from './collection'
import { CounterNamesEnum } from '../counters/enums'
import { convertToSearchableString } from '../core/functions'

Meteor.methods({
    async 'contacts.insert'(params) {
        return await ContactsQueue.add(() => {
            const contact = { ...params }
            contact.code = 'C' + Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.CONTACTS })

            contact.contactMethods.forEach((method, index) => {
                if (method.value === contact.phoneNumber) {
                    contact.contactMethods.splice(index, 1)
                }
            })
            if (Object.keys(contact.billingAddress).length === 0) {
                delete contact.billingAddress
            }
            if (Object.keys(contact.deliveryAddress).length === 0) {
                delete contact.deliveryAddress
            }
    
            return { added: true, _id: Contacts.insert(contact), code: contact.code }
        }).promise
    },
    'contacts.update'(params) {
        const schema = new SimpleSchema({
            _id: String,
            contact: {
                type: Object,
                blackbox: true
            }
        })
        schema.validate(schema.clean(params))
        
        const { _id, contact } = params

        contact.contactMethods.forEach((method, index) => {
            if (method.value === contact.phoneNumber) {
                contact.contactMethods.splice(index, 1)
            }
        })

        const fieldsToSet = {}
        const fieldsToUnset = {}
        Object.keys(contact).forEach(field => {
            if (
                (
                    typeof contact[field] === 'string' && contact[field] === ''
                ) ||
                (
                    typeof contact[field] === 'object' &&
                    !Array.isArray(contact[field]) &&
                    Object.keys(contact[field]).length === 0
                )
            ) {
                fieldsToUnset[field] = ''
            } else {
                fieldsToSet[field] = contact[field]
            }
        })

        return { updated: Contacts.update(_id, { $set: fieldsToSet, $unset: fieldsToUnset }) === 1 }
    },
    'contacts.delete'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        const linkedVehicles = Contacts.getLink(_id, 'vehicles')
        const vehiclesCount = linkedVehicles.find({}, { fields: { _id: 1 }}).count()

        if (vehiclesCount > 0) {
            throw new Meteor.Error('vehicles-associated')
        }

        return { deleted: Contacts.remove(_id) === 1 }
    },
    'contacts.deactivate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deactivated: Contacts.update(_id, { $set: { isActive: false }}) === 1 }
    },
    'contacts.activate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { activated: Contacts.update(_id, { $set: { isActive: true }}) === 1 }
    },
    'contacts.updateNotes'(params) {
        const schema = new SimpleSchema({
            _id: String,
            notes: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))
        
        const { _id, notes } = params

        if (notes) {
            return { updated: Contacts.update(_id, { $set: { notes }}) === 1 }
        }
        return { updated: Contacts.update(_id, { $unset: { notes }}) === 1 }
    },
    'contacts.contactExists'(params) {
        const schema = new SimpleSchema({
            name: String,
            phoneNumber: {
                type: String,
                defaultValue: ''
            },
            excludeId: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))

        const { name, phoneNumber, excludeId } = params
        
        const query = {
            searchableName: convertToSearchableString(name),
            phoneNumber
        }

        if (excludeId) {
            query._id = { $ne: excludeId }
        }

        return !!Contacts.findOne(query, { fields: { _id: 1 }})
    },
    'contacts.filterContacts'(params) {
        const schema = new SimpleSchema({
            filter: String
        })
        schema.validate(schema.clean(params))

        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        return Contacts.find({
            isActive: true,
            $or: [
                { code: { $regex: filter, $options: 'i' }},
                { name: { $regex: filter, $options: 'i' }},
                { phoneNumber: { $regex: filter, $options: 'i' }},
                { 'contactMethods.value': { $regex: filter, $options: 'i' }},
            ]
        }, {
            fields: {
                code: 1,
                type: 1,
                name: 1,
                phoneNumber: 1,
                contactMethods: 1
            },
            limit: 8
        }).fetch()
    },
    async 'contacts.getDistinctFieldValues'(params) {
        const schema = new SimpleSchema({
            field: String,
            filter: {
                type: String,
                defaultValue: ''
            }
        })
        schema.validate(schema.clean(params))

        const { field } = params
        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()
        const query = {}

        query[field] = { $regex: filter, $options: 'i' }

        const response = await Contacts.rawCollection().distinct(field, query)

        return response.filter(item => new RegExp(filter).test(item))
    }
})
