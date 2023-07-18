import { diff } from 'just-diff'
import { Contacts } from '../database'

const contactHasUpdates = (params) => {
  const { contactId, updated } = params

  const contact = Contacts.findOne(contactId, {
    fields: {
      type: 1,
      name: 1,
      phoneNumber: 1,
      tags: 1,
      billingAddress: 1,
      deliveryAddress: 1,
      taxRegNumber: 1,
      contactMethods: 1
    }
  })
  delete contact._id

  if (!contact.billingAddress) {
    contact.billingAddress = {}
  }
  if (!contact.deliveryAddress) {
    contact.deliveryAddress = {}
  }
  if (!contact.taxRegNumber) {
    contact.taxRegNumber = ''
  }

  return diff(contact, updated).length > 0
}

export { contactHasUpdates }
