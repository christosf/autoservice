import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  filter: {
    type: String,
    optional: true
  }
})

const getFilteredContactsQuery = Contacts.createQuery('contacts:get_filtered_contacts', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getFilteredContactsQuery
