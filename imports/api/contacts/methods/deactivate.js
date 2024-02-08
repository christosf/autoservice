import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const deactivateContact = createMethod({
  name: 'contacts:deactivate',

  schema: new SimpleSchema({
    contactId: String
  }),

  before: [checkLoggedIn],

  async run({ contactId }) {
    return { deactivated: await Contacts.updateAsync(contactId, { $set: { isActive: false } }) === 1 }
  }
})

export default deactivateContact
