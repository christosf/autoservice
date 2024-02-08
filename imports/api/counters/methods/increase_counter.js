import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Counters } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const increaseCounter = createMethod({
  name: 'counters:increase_counter',

  schema: new SimpleSchema({
    name: String
  }),

  before: [checkLoggedIn],

  async run({ name }) {
    const response = await Counters.rawCollection().findOneAndUpdate({ name }, { $inc: { counter: 1 } })

    return response.value.counter
  }
})

export default increaseCounter
