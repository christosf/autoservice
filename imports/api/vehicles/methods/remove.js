import SimpleSchema from 'simpl-schema'
import { Meteor } from 'meteor/meteor'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { countJobCards } from '../../job_cards/methods'
import { checkLoggedIn } from '../../users/utilities'

const removeVehicle = createMethod({
  name: 'vehicles:remove',

  schema: new SimpleSchema({
    vehicleId: String
  }),

  before: [checkLoggedIn],

  async run({ vehicleId }) {
    if (await countJobCards({ vehicleId }) > 0) {
      throw new Meteor.Error('associated-job-cards')
    }

    /*
    if (await countInvoices({ vehicleId }) > 0) {
      throw new Meteor.Error('associated-invoices')
    }
    */

    return { removed: await Vehicles.removeAsync(vehicleId) === 1 }
  }
})

export default removeVehicle
