import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateVehicleCount = createMethod({
  name: 'contacts:update_vehicle_count',

  schema: new SimpleSchema({
    contactId: String,
    vehicleCount: Number
  }),

  before: [checkLoggedIn],

  async run({ contactId, vehicleCount }) {
    return {
      updated: await Contacts.updateAsync(contactId, { $set: { vehicleCount } }) === 1
    }
  }
})

export default updateVehicleCount
