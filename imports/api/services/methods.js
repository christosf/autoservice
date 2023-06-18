import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Services } from '../database'

Meteor.methods({
    'services.insert'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            name: String,
            ratePerHour: {
                type: Number,
                optional: true
            },
            hours: {
                type: Number,
                optional: true
            },
            description: {
                type: String,
                optional: true
            },
            tags: Array,
            'tags.$': String,
            noVat: Boolean
        }).validate(params)
        
        const service = { ...params }
        service.code = 'S' + Meteor.call('counters.increaseServicesCounter')

        try {
            return { added: true, _id: Services.insert(service), code: service.code }
        } catch(error) {
            Meteor.call('counters.decreaseServicesCounter')
            throw error
        }
    },
    'services.update'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String,
            name: String,
            ratePerHour: {
                type: Number,
                optional: true
            },
            hours: {
                type: Number,
                optional: true
            },
            description: {
                type: String,
                optional: true
            },
            tags: Array,
            'tags.$': String,
            noVat: Boolean
        }).validate(params)

        const { _id } = params
        const service = { ...params }
        delete service._id
        
        return { updated: Services.update(_id, { $set: service }) === 1 }
    },
    'services.delete'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { deleted: Services.remove(_id) === 1 }
    },
    'services.deactivate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { deactivated: Services.update(_id, { $set: { active: false }}) === 1 }
    },
    'services.activate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { activated: Services.update(_id, { $set: { active: true }}) === 1 }
    },
    'services.serviceExists'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            name: String,
            excludeId: {
                type: String,
                optional: true
            }
        }).validate(params)

        const { name, excludeId } = params
        
        const query = {
            name: name.toUpperCase()
        }

        if (excludeId) {
            query._id = { $ne: excludeId }
        }

        return !!Services.findOne(query, { fields: { _id: 1 }})
    },
    async 'services.getDistinctFieldValues'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            field: String,
            filter: String
        }).validate(params)

        const { field } = params
        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()
        const query = {}

        query[field] = { $regex: filter, $options: 'i' }

        const response = await Services.rawCollection().distinct(field, query)

        return response.filter(item => new RegExp(filter).test(item))
    }
})
