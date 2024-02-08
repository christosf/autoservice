import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  vehicleId: String
})

const getVehicleEditableFieldsQuery = Vehicles.createQuery('vehicles:get_vehicle_editable_fields', {
  $filter({ filters, params }) {
    filters._id = params.vehicleId
  },
  _id: 1,
  ownerId: 1,
  make: 1,
  model: 1,
  regNumber: 1,
  chassisNumber: 1,
  tags: 1,
  bodyType: 1,
  fuelType: 1,
  engine: 1,
  gearbox: 1,
  drivetrain: 1,
  modelYear: 1,
  owner: {
    _id: 1,
    code: 1,
    type: 1,
    name: 1
  }
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleEditableFieldsQuery
