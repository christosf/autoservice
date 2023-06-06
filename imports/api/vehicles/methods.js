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

        vehicle.addedById = this.userId
        vehicle.code = 'V' + Meteor.call('counters.increaseVehiclesCounter')

        try {
            const vehicleId = Vehicles.insert(vehicle)
            return { added: true, vehicleId, code: vehicle.code }
        } catch(error) {
            Meteor.call('counters.decreaseVehiclesCounter')
            throw error
        }
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
    'vehicles.getDistinctFieldValues'(params) {
        if (Meteor.isClient) return

        new SimpleSchema({
            field: String,
            filter: String
        }).validate(params)

        /*
        // In case the results need to be limited, use this method (needs refinement)
        const results = []
        Vehicles.rawCollection().aggregate([
            { $match: { make: { $regex: filter, $options: 'i' }}},
            { '$group': { '_id': '$make' }},
            { '$limit': 8 }
        ]).toArray().then(res => {
            res.forEach(item => {
                results.push(item._id)
            })
            console.log(results)
        })*/

        const { field } = params
        const filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()
        const query = {}

        query[field] = { $regex: filter, $options: 'i' }

        return Vehicles.rawCollection().distinct(field, query)
    }
})
