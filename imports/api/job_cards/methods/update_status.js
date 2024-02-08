import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateStatus = createMethod({
  name: 'job_cards:update_status',

  schema: new SimpleSchema({
    jobCardId: String,
    status: String
  }),

  before: [checkLoggedIn],

  async run({ jobCardId, status }) {
    return {
      updated: await JobCards.updateAsync(jobCardId, { $set: {
        status,
        updatedAt: new Date()
      }}) === 1
    }
  }
})

export default updateStatus