import { Match } from 'meteor/check'
import { Vehicles } from '../../database'

export default Vehicles.createQuery('getVehicle', {
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
    code: 1,
    name: 1,
    phoneNumber: 1
  },
  isActive: 1,
  updatedAt: 1,
  searchableMake: 1,
  searchableModel: 1
}, {
  validateParams: {
    vehicleId: Match.Maybe(String),
    code: Match.Maybe(String)
  }
})
