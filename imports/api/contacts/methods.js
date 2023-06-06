import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Contacts } from '../database'
import { ContactTypesEnum } from './enums'

Meteor.methods({
    'contacts.insert'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            type: String,
            name: String,
            mobilePhone: {
                type: String,
                optional: true
            },
            landlinePhone: {
                type: String,
                optional: true
            },
            addresses: Array,
            'addresses.$': Object,
            'addresses.$.street': String,
            'addresses.$.city': String,
            'addresses.$.postalCode': String,
            'addresses.$.type': String,
            email: {
                type: String,
                optional: true
            },
            website: {
                type: String,
                optional: true
            },
            vatNumber: {
                type: String,
                optional: true
            }
        }).validate(params)
        
        const contact = { ...params }
        contact.code = 'C' + Meteor.call('counters.increaseContactsCounter')

        try {
            return { added: true, _id: Contacts.insert(contact), code: contact.code }
        } catch(error) {
            Meteor.call('counters.decreaseContactsCounter')
            throw error
        }
    },
    'contacts.update'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String,
            type: String,
            name: String,
            mobilePhone: {
                type: String,
                optional: true
            },
            landlinePhone: {
                type: String,
                optional: true
            },
            addresses: Array,
            'addresses.$': Object,
            'addresses.$.street': String,
            'addresses.$.city': String,
            'addresses.$.postalCode': String,
            'addresses.$.type': String,
            email: {
                type: String,
                optional: true
            },
            website: {
                type: String,
                optional: true
            },
            vatNumber: {
                type: String,
                optional: true
            }
        }).validate(params)
        
        const { _id } = params
        const contact = { ...params }
        delete contact._id
        
        return { updated: Contacts.update(_id, { $set: contact }) === 1 }
    },
    'contacts.deactivate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { deactivated: Contacts.update(_id, { $set: { active: false }}) === 1 }
    },
    'contacts.activate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { activated: Contacts.update(_id, { $set: { active: true }}) === 1 }
    },
    'contacts.delete'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        const linkedVehicles = Contacts.getLink(_id, 'vehicles')
        const vehiclesCount = linkedVehicles.find({}, { fields: { _id: 1 }}).count()

        if (vehiclesCount > 0) {
            throw new Meteor.Error('vehicles-associated')
        }

        return { deleted: Contacts.remove(_id) === 1 }
    },
    'contacts.contactExists'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            type: String,
            name: String,
            phone: String,
            excludeId: {
                type: String,
                optional: true
            }
        }).validate(params)

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
        
        new SimpleSchema({
            filter: String
        }).validate(params)

        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        return Contacts.find({
            active: true,
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
    }
})
