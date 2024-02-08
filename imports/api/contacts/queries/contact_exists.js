import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  name: String,
  phoneNumber: {
    type: String,
    defaultValue: ''
  },
  excludeId: {
    type: String,
    optional: true
  }
})

const contactExistsQuery = Contacts.createQuery('contacts:contact_exists', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default contactExistsQuery
