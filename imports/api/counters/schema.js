import SimpleSchema from 'simpl-schema'
import { CounterNamesEnum } from './enums'

export default new SimpleSchema({
    name: {
        type: String,
        allowedValues: Object.values(CounterNamesEnum)
    },
    counter: {
        type: SimpleSchema.Integer,
        defaultValue: 100001
    }
})
