import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const activateVehicle = createMethod({
  name: 'vehicles:activate',

  schema: new SimpleSchema({
    vehicleId: String
  }),

  before: [checkLoggedIn],

  async run({ vehicleId }) {
    return { activated: await Vehicles.updateAsync(vehicleId, { $set: { isActive: true } }) === 1 }
  }
})

export default activateVehicle
