import { getJobCardQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getJobCardQuery.expose({
  firewall: [checkLoggedIn]
})
