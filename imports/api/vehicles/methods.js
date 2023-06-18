import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../database'

Meteor.methods({
    'vehicles.insert'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
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
        }).validate(params)
        
        const vehicle = { ...params }
        vehicle.code = 'V' + Meteor.call('counters.increaseVehiclesCounter')
        vehicle.makeModel = `${vehicle.make} ${vehicle.model}`.toUpperCase()

        try {
            return { added: true, _id: Vehicles.insert(vehicle), code: vehicle.code }
        } catch(error) {
            Meteor.call('counters.decreaseVehiclesCounter')
            throw error
        }
    },
    'vehicles.update'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
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
        }).validate(params)

        const { _id } = params
        const vehicle = { ...params }
        delete vehicle._id

        vehicle.makeModel = `${vehicle.make} ${vehicle.model}`.toUpperCase()
        
        return { updated: Vehicles.update(_id, { $set: vehicle }) === 1 }
    },
    'vehicles.delete'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        // TODO: Do not allow if vehicles has jobcards.
        return { deleted: Vehicles.remove(_id) === 1 }
    },
    'vehicles.deactivate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { deactivated: Vehicles.update(_id, { $set: { active: false }}) === 1 }
    },
    'vehicles.activate'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            _id: String
        }).validate(params)

        const { _id } = params

        return { activated: Vehicles.update(_id, { $set: { active: true }}) === 1 }
    },
    'vehicles.fieldValueExists'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            field: String,
            value: String,
            excludeId: {
                type: String,
                optional: true
            }
        }).validate(params)

        const { field, value, excludeId } = params

        const query = excludeId ? { _id: { $ne: excludeId } } : {}
        query[field] = value.toUpperCase()

        return !!Vehicles.findOne(query, { fields: { _id: 1 }})
    },
    async 'vehicles.getDistinctFieldValues'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            field: String,
            filter: String
        }).validate(params)

        const { field } = params
        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()
        const query = {}

        query[field] = { $regex: filter, $options: 'i' }

        const response = await Vehicles.rawCollection().distinct(field, query)

        return response.filter(item => new RegExp(filter).test(item))
    }
})
