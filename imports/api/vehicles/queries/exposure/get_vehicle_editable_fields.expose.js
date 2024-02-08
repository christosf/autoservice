import { getVehicleEditableFieldsQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getVehicleEditableFieldsQuery.expose({
  firewall: [checkLoggedIn]
})
