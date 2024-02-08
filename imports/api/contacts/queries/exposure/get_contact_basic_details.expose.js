import { Contacts } from '../../../database'
import { getContactBasicDetailsQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getContactBasicDetailsQuery.expose({
  firewall: [checkLoggedIn]
})

getContactBasicDetailsQuery.resolve(async function(params) {
  const { contactId } = params

  return new Array(await Contacts.findOneAsync(contactId, { fields: { code: 1, name: 1 } }))
})
