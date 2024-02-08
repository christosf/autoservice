import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const countVehicles = createMethod({
  name: 'vehicles:count',

  schema: new SimpleSchema({
    ownerId: {
      type: String,
      optional: true
    },
    isActive: {
      type: Boolean,
      optional: true
    }
  }),

  before: [checkLoggedIn],

  async run(params) {
    return Vehicles.countDocuments(params)
  }
})

export default countVehicles
