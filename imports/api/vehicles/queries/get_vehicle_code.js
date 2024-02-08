import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['prev', 'next']
  },
  vehicleId: String,
  sortBy: String,
  descending: Boolean
})

const getVehicleCodeQuery = Vehicles.createQuery('vehicles:get_vehicle_code', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleCodeQuery
