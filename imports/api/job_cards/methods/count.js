import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const countJobCards = createMethod({
  name: 'job_cards:count',

  schema: new SimpleSchema({
    ownerId: {
      type: String,
      optional: true
    },
    vehicleId: {
      type: String,
      optional: true
    }
  }),

  before: [checkLoggedIn],

  async run(params) {
    return JobCards.countDocuments(params)
  }
})

export default countJobCards
