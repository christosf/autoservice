import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateNotes = createMethod({
  name: 'vehicles:update_notes',

  schema: new SimpleSchema({
    vehicleId: String,
    notes: {
      type: String,
      optional: true
    }
  }),

  before: [checkLoggedIn],

  async run({ vehicleId, notes }) {
    return {
      updated: await Vehicles.updateAsync(
        vehicleId,
        notes
          ? { $set: { notes, updatedAt: new Date() } }
          : { $unset: { notes }, $set: { updatedAt: new Date() } }
      ) === 1
    }
  }
})

export default updateNotes
