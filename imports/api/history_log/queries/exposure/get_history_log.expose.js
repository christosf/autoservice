import { getHistoryLogQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getHistoryLogQuery.expose({
  firewall: [checkLoggedIn]
})
