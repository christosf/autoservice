import { getVehicleQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getVehicleQuery.expose({
  firewall: [checkLoggedIn]
})
