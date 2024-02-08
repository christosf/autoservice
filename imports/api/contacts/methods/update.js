import SimpleSchema from 'simpl-schema'
import { Meteor } from 'meteor/meteor'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { hasUpdatedFields } from './index'
import { ContactMethodTypesEnum } from '../enums'
import { checkLoggedIn } from '../../users/utilities'

const updateContact = createMethod({
  name: 'contacts:update',

  schema: new SimpleSchema({
    contactId: String,
    contact: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ contactId, contact }) {
    // Remove contact method if it is the same as the main phone number.
    contact.contactMethods.forEach((method, index) => {
      if (method.type === ContactMethodTypesEnum.PHONE && method.value === contact.phoneNumber) {
        contact.contactMethods.splice(index, 1)
      }
    })

    const contactHasUpdatedFields = await hasUpdatedFields({ contactId, updatedContact: contact })

    if (!contactHasUpdatedFields) {
      throw new Meteor.Error('no-updated-fields')
    }

    // Set updatedAt field.
    contact.updatedAt = new Date()

    return {
      updated: await Contacts.updateAsync(contactId, { $set: contact }) === 1
    }
  }
})

export default updateContact
