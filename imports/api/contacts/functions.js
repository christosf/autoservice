import { diff } from 'just-diff'
import { Contacts } from '../database'

const contactHasUpdates = (_id, updates) => {
    const contact = Contacts.findOne(_id, {
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
    if (!contact.billingAddress) contact.billingAddress = {}
    if (!contact.deliveryAddress) contact.deliveryAddress = {}
    if (!contact.taxRegNumber) contact.taxRegNumber = ''

    return diff(contact, updates).length > 0
}

export { contactHasUpdates }