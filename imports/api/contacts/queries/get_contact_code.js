import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['prev', 'next']
  },
  contactId: String,
  sortBy: String,
  descending: Boolean
})

const getContactCodeQuery = Contacts.createQuery('contacts:get_contact_code', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getContactCodeQuery
