import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  vehicleId: String
})

const getVehicleBasicDetailsQuery = Vehicles.createQuery('vehicles:get_vehicle_basic_details', () => {}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleBasicDetailsQuery
