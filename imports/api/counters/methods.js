import { Meteor } from 'meteor/meteor'
import { Counters } from '../database'
import { CounterNamesEnum } from './enums'

Meteor.methods({
    async 'counters.increaseContactsCounter'() {
        const res = await Counters.rawCollection().findOneAndUpdate({
            name: CounterNamesEnum.CONTACTS
        }, { $inc: { counter: 1 }})
        
        return res.value.counter
    },
    async 'counters.decreaseContactsCounter'() {
        const res = await Counters.rawCollection().findOneAndUpdate({
            name: CounterNamesEnum.CONTACTS
        }, { $inc: { counter: -1 }})
        
        return res.value.counter
    },
    async 'counters.increaseVehiclesCounter'() {
        const res = await Counters.rawCollection().findOneAndUpdate({
            name: CounterNamesEnum.VEHICLES
        }, { $inc: { counter: 1 }})
        
        return res.value.counter
    },
    async 'counters.decreaseVehiclesCounter'() {
        const res = await Counters.rawCollection().findOneAndUpdate({
            name: CounterNamesEnum.VEHICLES
        }, { $inc: { counter: -1 }})
        
        return res.value.counter
    }
})
