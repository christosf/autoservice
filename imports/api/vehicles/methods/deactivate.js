import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const deactivateVehicle = createMethod({
  name: 'vehicles:deactivate',

  schema: new SimpleSchema({
    vehicleId: String
  }),

  before: [checkLoggedIn],

  async run({ vehicleId }) {
    return { deactivated: await Vehicles.updateAsync(vehicleId, { $set: { isActive: false } }) === 1 }
  }
})

export default deactivateVehicle
