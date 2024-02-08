import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateNotes = createMethod({
  name: 'job_cards:update_notes',

  schema: new SimpleSchema({
    jobCardId: String,
    notes: {
      type: String,
      optional: true
    }
  }),

  before: [checkLoggedIn],

  async run({ jobCardId, notes }) {
    return {
      updated: await JobCards.updateAsync(
        jobCardId,
        notes
          ? { $set: { notes, updatedAt: new Date() } }
          : { $unset: { notes }, $set: { updatedAt: new Date() } }
      ) === 1
    }
  }
})

export default updateNotes
