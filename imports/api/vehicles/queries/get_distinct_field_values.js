import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  field: String,
  filter: {
    type: String,
    defaultValue: ''
  },
  basedOn: {
    type: String,
    defaultValue: ''
  }
})

const getDistinctFieldValuesQuery = Vehicles.createQuery('vehicles:get_distinct_field_values', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getDistinctFieldValuesQuery
