import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  contactId: {
    type: String,
    optional() {
      return this.field('code').isSet
    }
  },
  code: {
    type: String,
    optional() {
      return this.field('contactId').isSet
    }
  }
})

const getContactQuery = Contacts.createQuery('contacts:get_contact', {
  $filter({ filters, params }) {
    if (params.contactId) {
      filters._id = params.contactId
    }
    if (params.code) {
      filters.code = params.code.toUpperCase()
    }
  },
  _id: 1,
  code: 1,
  type: 1,
  name: 1,
  phoneNumber: 1,
  tags: 1,
  billingAddress: 1,
  deliveryAddress: 1,
  taxRegNumber: 1,
  contactMethods: {
    type: 1,
    value: 1,
    description: 1
  },
  notes: 1,
  balance: 1,
  vehicleCount: 1,
  isActive: 1,
  updatedAt: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getContactQuery
