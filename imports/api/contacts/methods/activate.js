import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const activateContact = createMethod({
  name: 'contacts:activate',

  schema: new SimpleSchema({
    contactId: String
  }),

  before: [checkLoggedIn],

  async run({ contactId }) {
    return { activated: await Contacts.updateAsync(contactId, { $set: { isActive: true } }) === 1 }
  }
})

export default activateContact
