import { getJobCardListQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getJobCardListQuery.expose({
  firewall: [checkLoggedIn]
})
