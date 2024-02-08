import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updatePriority = createMethod({
  name: 'job_cards:update_priority',

  schema: new SimpleSchema({
    jobCardId: String,
    priority: Number
  }),

  before: [checkLoggedIn],

  async run({ jobCardId, priority }) {
    return {
      updated: await JobCards.updateAsync(jobCardId, {
        $set: {
          priority,
          updatedAt: new Date()
        }
      }) === 1
    }
  }
})

export default updatePriority
