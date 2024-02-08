import { getVehicleListQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getVehicleListQuery.expose({
  firewall: [checkLoggedIn]
})
