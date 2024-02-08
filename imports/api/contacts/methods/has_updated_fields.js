import SimpleSchema from 'simpl-schema'
import { diff } from 'just-diff'
import { createMethod } from 'meteor/jam:method'
import { getContactEditableFieldsQuery } from '../queries'
import { checkLoggedIn } from '../../users/utilities'

const hasUpdatedFields = createMethod({
  name: 'contacts:has_updated_fields',

  schema: new SimpleSchema({
    contactId: String,
    updatedContact: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ contactId, updatedContact }) {
    const contact = getContactEditableFieldsQuery.clone({ contactId }).fetchOne()

    delete contact._id

    if (!contact.billingAddress) { contact.billingAddress = {} }
    if (!contact.deliveryAddress) { contact.deliveryAddress = {} }
    if (!contact.taxRegNumber) { contact.taxRegNumber = '' }

    return diff(contact, updatedContact).length > 0
  }
})

export default hasUpdatedFields
