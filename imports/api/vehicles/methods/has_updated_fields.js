import SimpleSchema from 'simpl-schema'
import { diff } from 'just-diff'
import { createMethod } from 'meteor/jam:method'
import { getVehicleEditableFieldsQuery } from '../queries'
import { checkLoggedIn } from '../../users/utilities'

const hasUpdatedFields = createMethod({
  name: 'vehicles:has_updated_fields',

  schema: new SimpleSchema({
    vehicleId: String,
    updatedVehicle: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ vehicleId, updatedVehicle }) {
    const vehicle = getVehicleEditableFieldsQuery.clone({ vehicleId }).fetchOne()

    delete vehicle._id
    delete vehicle.owner

    if (!vehicle.regNumber) { vehicle.regNumber = '' }
    if (!vehicle.chassisNumber) { vehicle.chassisNumber = '' }
    if (!vehicle.bodyType) { vehicle.bodyType = '' }
    if (!vehicle.fuelType) { vehicle.fuelType = '' }
    if (!vehicle.engine) { vehicle.engine = '' }
    if (!vehicle.gearbox) { vehicle.gearbox = '' }
    if (!vehicle.drivetrain) { vehicle.drivetrain = '' }
    if (!vehicle.modelYear) { vehicle.modelYear = '' }

    return diff(vehicle, updatedVehicle).length > 0
  }
})

export default hasUpdatedFields
