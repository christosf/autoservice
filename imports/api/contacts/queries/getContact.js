import { Match } from 'meteor/check'
import { Contacts } from '../../database'

export default Contacts.createQuery('getContact', {
  $filter({ filters, params }) {
    if (params.contactId) {
      filters._id = params.contactId
    }
    if (params.code) {
      filters.code = params.code.toUpperCase()
    }
  },
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
  vehicles: {
    $filters: {
      isActive: true
    },
    code: 1,
    make: 1,
    model: 1,
    regNumber: 1,
    tags: 1,
    updatedAt: 1
  },
  isActive: 1,
  updatedAt: 1,
  searchableName: 1
}, {
  validateParams: {
    contactId: Match.Maybe(String),
    code: Match.Maybe(String)
  }
})
