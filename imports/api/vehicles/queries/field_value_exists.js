import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  field: String,
  value: {
    type: String,
    optional: true
  },
  excludeId: {
    type: String,
    optional: true
  }
})

const fieldValueExistsQuery = Vehicles.createQuery('vehicles:field_value_exists', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default fieldValueExistsQuery
