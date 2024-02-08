import { Vehicles } from '../../../database'
import { checkLoggedIn } from '../../../users/utilities'
import { getVehicleBasicDetailsQuery } from '../index'

getVehicleBasicDetailsQuery.expose({
  firewall: [checkLoggedIn]
})

getVehicleBasicDetailsQuery.resolve(async function(params) {
  const { vehicleId } = params

  return new Array(await Vehicles.findOneAsync(vehicleId, { fields: { regNumber: 1, makeModel: 1 } }))
})
