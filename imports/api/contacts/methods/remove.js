import SimpleSchema from 'simpl-schema'
import { Meteor } from 'meteor/meteor'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { countVehicles } from '../../vehicles/methods'
import { countJobCards } from '../../job_cards/methods'
import { checkLoggedIn } from '../../users/utilities'

const removeContact = createMethod({
  name: 'contacts:remove',

  schema: new SimpleSchema({
    contactId: String
  }),

  before: [checkLoggedIn],

  async run({ contactId }) {
    if (await countJobCards({ ownerId: contactId }) > 0) {
      throw new Meteor.Error('associated-job-cards')
    }

    if (await countVehicles({ ownerId: contactId }) > 0) {
      throw new Meteor.Error('associated-vehicles')
    }

    return { removed: await Contacts.removeAsync(contactId) === 1 }
  }
})

export default removeContact
