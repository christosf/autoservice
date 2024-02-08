import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Vehicles } from '../../database'
import { VehiclesQueue } from '../collection'
import { CounterNamesEnum } from '../../counters/enums'
import { increaseCounter } from '../../counters/methods'
import { checkLoggedIn } from '../../users/utilities'

const insertVehicle = createMethod({
  name: 'vehicles:insert',

  schema: new SimpleSchema({
    vehicle: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ vehicle }) {
    const task = VehiclesQueue.add(async() => {
      // Generate unique vehicle code.
      vehicle.code = `V${await increaseCounter({ name: CounterNamesEnum.VEHICLES })}`

      // Set makeModel based on two fields.
      vehicle.makeModel = `${vehicle.make} ${vehicle.model}`

      return { _id: await Vehicles.insertAsync(vehicle), code: vehicle.code }
    })

    return task.promise
  }
})

export default insertVehicle
