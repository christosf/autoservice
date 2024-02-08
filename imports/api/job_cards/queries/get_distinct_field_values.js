import SimpleSchema from 'simpl-schema'
import { JobCards } from '../../database'

const schema = new SimpleSchema({
  field: String,
  filter: {
    type: String,
    defaultValue: ''
  }
})

const getDistinctFieldValuesQuery = JobCards.createQuery('job_cards:get_distinct_field_values', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getDistinctFieldValuesQuery
