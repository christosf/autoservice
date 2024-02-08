import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  contactId: String
})

const getContactBasicDetailsQuery = Contacts.createQuery('contacts:get_contact_basic_details', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getContactBasicDetailsQuery
