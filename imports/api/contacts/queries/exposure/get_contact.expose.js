import { getContactQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getContactQuery.expose({
  firewall: [checkLoggedIn]
})
