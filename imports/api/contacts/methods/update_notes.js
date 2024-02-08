import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateNotes = createMethod({
  name: 'contacts:update_notes',

  schema: new SimpleSchema({
    contactId: String,
    notes: {
      type: String,
      optional: true
    }
  }),

  before: [checkLoggedIn],

  async run({ contactId, notes }) {
    return {
      updated: await Contacts.updateAsync(
        contactId,
        notes
          ? { $set: { notes, updatedAt: new Date() } }
          : { $unset: { notes }, $set: { updatedAt: new Date() } }
      ) === 1
    }
  }
})

export default updateNotes
