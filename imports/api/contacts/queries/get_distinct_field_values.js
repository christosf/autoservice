import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'

const schema = new SimpleSchema({
  field: String,
  filter: {
    type: String,
    defaultValue: ''
  }
})

const getDistinctFieldValuesQuery = Contacts.createQuery('contacts:get_distinct_field_values', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getDistinctFieldValuesQuery
