import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Contacts } from '../database'
import { ContactsQueue } from './collection'
import { ContactTypesEnum } from './enums'
import { CounterNamesEnum } from '../counters/enums'

Meteor.methods({
    async 'contacts.insert'(params) {
        /*
            No validation is needed here because no editing of params is done in this method.
            Params are validated by the attached schema on the collection.
        */
        if (Meteor.isClient) return

        return await ContactsQueue.add(() => {
            const contact = { ...params }
            contact.code = 'C' + Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.CONTACTS })
    
            try {
                return { added: true, _id: Contacts.insert(contact), code: contact.code }
            } catch(error) {
                Meteor.call('counters.decreaseCounter', { name: CounterNamesEnum.CONTACTS })
                throw error
            }
        }).promise
    },
    'contacts.update'(params) {
        if (Meteor.isClient) return

        const schema = new SimpleSchema({
            _id: String,
            contact: {
                type: Object,
                blackbox: true
            }
        })
        schema.validate(schema.clean(params))
        
        const { _id, contact } = params

        const fieldsToSet = {}
        const fieldsToUnset = {}
        Object.keys(contact).forEach(field => {
            if (contact[field] === '') {
                fieldsToUnset[field] = ''
            } else {
                fieldsToSet[field] = contact[field]
            }
        })
        
        return { updated: Contacts.update(_id, { $set: fieldsToSet, $unset: fieldsToUnset }) === 1 }
    },
    'contacts.delete'(params) {
        if (Meteor.isClient) return

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
        if (Meteor.isClient) return

        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deactivated: Contacts.update(_id, { $set: { isActive: false }}) === 1 }
    },
    'contacts.activate'(params) {
        if (Meteor.isClient) return

        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { activated: Contacts.update(_id, { $set: { isActive: true }}) === 1 }
    },
    'contacts.updateNotes'(params) {
        if (Meteor.isClient) return

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
        if (Meteor.isClient) return

        const schema = new SimpleSchema({
            type: String,
            name: String,
            phone: String,
            excludeId: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))

        const { type, name, phone, excludeId } = params
        
        const query = type === ContactTypesEnum.COMPANY
            ? { landlinePhone: phone}
            : { mobilePhone: phone }
        
        query.name = name.toUpperCase()

        if (excludeId) {
            query._id = { $ne: excludeId }
        }

        return !!Contacts.findOne(query, { fields: { _id: 1 }})
    },
    'contacts.filterContacts'(params) {
        if (Meteor.isClient) return
        
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
                { mobilePhone: { $regex: filter, $options: 'i' }},
                { landlinePhone: { $regex: filter, $options: 'i' }},
            ],
        }, {
            fields: {
                code: 1,
                type: 1,
                name: 1,
                mobilePhone: 1,
                landlinePhone: 1
            },
            limit: 8
        }).fetch()
    },
    async 'contacts.getDistinctFieldValues'(params) {
        if (Meteor.isClient) return

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
