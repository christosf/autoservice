import { getVehicleListByOwnerQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getVehicleListByOwnerQuery.expose({
  firewall: [checkLoggedIn]
})
