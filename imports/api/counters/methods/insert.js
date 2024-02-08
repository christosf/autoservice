import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Counters } from '../../database'

const insertCounter = createMethod({
  name: 'counters:insert',

  schema: new SimpleSchema({
    name: String
  }),

  async run({ name }) {
    const count = await Counters.countDocuments({ name })

    if (count === 0) {
      return { inserted: true, _id: await Counters.insertAsync({ name }) }
    }
    return { inserted: false, reason: 'counter-already-exists' }
  }
})

export default insertCounter
