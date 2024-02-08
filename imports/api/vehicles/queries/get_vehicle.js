import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

const schema = new SimpleSchema({
  vehicleId: {
    type: String,
    optional() {
      return this.field('code').isSet
    }
  },
  code: {
    type: String,
    optional() {
      return this.field('vehicleId').isSet
    }
  }
})

const getVehicleQuery = Vehicles.createQuery('vehicles:get_vehicle', {
  $filter({ filters, params }) {
    if (params.vehicleId) {
      filters._id = params.vehicleId
    }
    if (params.code) {
      filters.code = params.code.toUpperCase()
    }
  },
  _id: 1,
  code: 1,
  make: 1,
  model: 1,
  makeModel: 1,
  regNumber: 1,
  chassisNumber: 1,
  tags: 1,
  bodyType: 1,
  fuelType: 1,
  engine: 1,
  gearbox: 1,
  drivetrain: 1,
  modelYear: 1,
  notes: 1,
  owner: {
    _id: 1,
    code: 1,
    name: 1,
    phoneNumber: 1,
    isActive: 1
  },
  isActive: 1,
  updatedAt: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleQuery
