import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../database'
import { CounterNamesEnum } from '../counters/enums'

Meteor.methods({
    'vehicles.insert'(params) {
        const schema = new SimpleSchema({
            ownerId: String,
            make: String,
            model: String,
            regNumber: {
                type: String,
                optional: true
            },
            chassisNumber: {
                type: String,
                optional: true
            },
            tags: Array,
            'tags.$': String,
            bodyType: {
                type: String,
                optional: true
            },
            fuelType: {
                type: String,
                optional: true
            },
            engine: {
                type: String,
                optional: true
            },
            gearbox: {
                type: String,
                optional: true
            },
            drivetrain: {
                type: String,
                optional: true
            },
            modelYear: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))
        
        const vehicle = { ...params }
        vehicle.code = 'V' + Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.VEHICLES })
        vehicle.makeModel = `${vehicle.make} ${vehicle.model}`.toUpperCase()

        try {
            return { added: true, _id: Vehicles.insert(vehicle), code: vehicle.code }
        } catch(error) {
            Meteor.call('counters.decreaseCounter', { name: CounterNamesEnum.VEHICLES })
            throw error
        }
    },
    'vehicles.update'(params) {
        const schema = new SimpleSchema({
            _id: String,
            ownerId: String,
            make: String,
            model: String,
            regNumber: {
                type: String,
                optional: true
            },
            chassisNumber: {
                type: String,
                optional: true
            },
            tags: Array,
            'tags.$': String,
            bodyType: {
                type: String,
                optional: true
            },
            fuelType: {
                type: String,
                optional: true
            },
            engine: {
                type: String,
                optional: true
            },
            gearbox: {
                type: String,
                optional: true
            },
            drivetrain: {
                type: String,
                optional: true
            },
            modelYear: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))

        const { _id } = params
        const vehicle = { ...params }
        delete vehicle._id

        vehicle.makeModel = `${vehicle.make} ${vehicle.model}`.toUpperCase()
        
        return { updated: Vehicles.update(_id, { $set: vehicle }) === 1 }
    },
    'vehicles.delete'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        // TODO: Do not allow if vehicles has jobcards.
        return { deleted: Vehicles.remove(_id) === 1 }
    },
    'vehicles.deactivate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { deactivated: Vehicles.update(_id, { $set: { isActive: false }}) === 1 }
    },
    'vehicles.activate'(params) {
        const schema = new SimpleSchema({
            _id: String
        })
        schema.validate(schema.clean(params))

        const { _id } = params

        return { activated: Vehicles.update(_id, { $set: { isActive: true }}) === 1 }
    },
    'vehicles.fieldValueExists'(params) {
        const schema = new SimpleSchema({
            field: String,
            value: {
                type: String,
                defaultValue: ''
            },
            excludeId: {
                type: String,
                optional: true
            }
        })
        schema.validate(schema.clean(params))

        const { field, value, excludeId } = params

        const query = excludeId ? { _id: { $ne: excludeId } } : {}
        query[field] = value.toUpperCase()

        return !!Vehicles.findOne(query, { fields: { _id: 1 }})
    },
    async 'vehicles.getDistinctFieldValues'(params) {
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

        const response = await Vehicles.rawCollection().distinct(field, query)

        return response.filter(item => new RegExp(filter).test(item))
    }
})
