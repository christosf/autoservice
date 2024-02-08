import { getContactListQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getContactListQuery.expose({
  firewall: [checkLoggedIn]
})
