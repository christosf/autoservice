import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateJobCard = createMethod({
  name: 'job_cards:update',

  schema: new SimpleSchema({
    jobCardId: String,
    jobCard: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run(params) {
    const { jobCardId, jobCard } = params

    jobCard.updatedAt = new Date()

    return {
      updated: await JobCards.updateAsync(jobCardId, { $set: jobCard }) === 1
    }
  }
})

export default updateJobCard
