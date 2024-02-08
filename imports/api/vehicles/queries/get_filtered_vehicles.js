import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  filter: {
    type: String,
    optional: true
  }
})

const getFilteredVehiclesQuery = Vehicles.createQuery('vehicles:get_filtered_vehicles', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getFilteredVehiclesQuery
