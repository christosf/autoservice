import { Meteor } from 'meteor/meteor'
import { Counters } from '../database'
import SimpleSchema from 'simpl-schema'

Meteor.methods({
    async 'counters.increaseCounter'(params) {
        const schema = new SimpleSchema({
            name: String
        })
        schema.validate(schema.clean(params))

        const { name } = params

        const res = await Counters.rawCollection().findOneAndUpdate({ name }, { $inc: { counter: 1 }})
        
        return res.value.counter
    },
    async 'counters.decreaseCounter'(params) {
        const schema = new SimpleSchema({
            name: String
        })
        schema.validate(schema.clean(params))

        const { name } = params

        const res = await Counters.rawCollection().findOneAndUpdate({ name }, { $inc: { counter: -1 }})
        
        return res.value.counter
    }
})
