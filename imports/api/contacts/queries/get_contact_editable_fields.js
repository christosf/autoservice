import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  contactId: String
})

const getContactEditableFieldsQuery = Contacts.createQuery('contacts:get_contact_editable_fields', {
  $filter({ filters, params }) {
    filters._id = params.contactId
  },
  _id: 1,
  type: 1,
  name: 1,
  phoneNumber: 1,
  tags: 1,
  billingAddress: 1,
  deliveryAddress: 1,
  taxRegNumber: 1,
  contactMethods: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getContactEditableFieldsQuery
