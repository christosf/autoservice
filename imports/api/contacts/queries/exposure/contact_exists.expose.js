import { Contacts } from '../../../database'
import { contactExistsQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'
import { convertToSearchableString } from '../../../core/utilities'

contactExistsQuery.expose({
  firewall: [checkLoggedIn]
})

contactExistsQuery.resolve(async function(params) {
  const { name, phoneNumber, excludeId } = params

  const query = {
    searchableName: convertToSearchableString({ value: name }),
    phoneNumber
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  return new Array(!!await Contacts.findOneAsync(query, { fields: { _id: 1 } }))
})
