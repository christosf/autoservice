import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Services } from '../database'
import { CounterNamesEnum } from '../counters/enums'

Meteor.methods({
    'services.insert'(params) {
        const schema = new SimpleSchema({
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
        })
        schema.validate(schema.clean(params))
        
        const service = { ...params }
        service.code = 'S' + Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.SERVICES })

        try {
            return { added: true, _id: Services.insert(service), code: service.code }
        } catch(error) {
            Meteor.call('counters.decreaseCounter', { name: CounterNamesEnum.SERVICES })
            throw error
        }
    },
    'services.update'(params) {
        const schema = new SimpleSchema({
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
        })
        schema.validate(schema.clean(params))

        const { _id } = params
        const service = { ...params }
        delete service._id
        
        return { updated: Services.update(_id, { $set: service }) === 1 }
    },
    'services.delete'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deleted: Services.remove(_id) === 1 }
    },
    'services.deactivate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deactivated: Services.update(_id, { $set: { isActive: false }}) === 1 }
    },
    'services.activate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { activated: Services.update(_id, { $set: { isActive: true }}) === 1 }
    },
    'services.serviceExists'(params) {
        const schema = new SimpleSchema({
            name: String,
            excludeId: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))

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

        const response = await Services.rawCollection().distinct(field, query)

        return response.filter(item => new RegExp(filter).test(item))
    }
})
