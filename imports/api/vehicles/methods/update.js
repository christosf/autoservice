import SimpleSchema from 'simpl-schema'
import { Meteor } from 'meteor/meteor'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { hasUpdatedFields } from './index'
import { checkLoggedIn } from '../../users/utilities'

const updateVehicle = createMethod({
  name: 'vehicles:update',

  schema: new SimpleSchema({
    vehicleId: String,
    vehicle: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ vehicleId, vehicle }) {
    const vehicleHasUpdatedFields = await hasUpdatedFields({ vehicleId, updatedVehicle: vehicle })

    if (!vehicleHasUpdatedFields) {
      throw new Meteor.Error('no-updated-fields')
    }

    vehicle.makeModel = `${vehicle.make} ${vehicle.model}`
    vehicle.updatedAt = new Date()

    return {
      updated: await Vehicles.updateAsync(vehicleId, { $set: vehicle }) === 1
    }
  }
})

export default updateVehicle
