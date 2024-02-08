import { getContactEditableFieldsQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getContactEditableFieldsQuery.expose({
  firewall: [checkLoggedIn]
})
