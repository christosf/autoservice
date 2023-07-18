import { Contacts } from '../../database'

export default Contacts.createQuery('getContactEditableFields', {
  $filter({ filters, params }) {
    filters._id = params.contactId
  },
  type: 1,
  name: 1,
  phoneNumber: 1,
  tags: 1,
  billingAddress: 1,
  deliveryAddress: 1,
  taxRegNumber: 1,
  contactMethods: 1
})
