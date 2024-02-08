import { Contacts } from '../../../database'
import { checkLoggedIn } from '../../../users/utilities'
import { convertToSearchableRegex } from '../../../core/utilities'
import { getFilteredContactsQuery } from '../index'

getFilteredContactsQuery.expose({
  firewall: [checkLoggedIn]
})

getFilteredContactsQuery.resolve(async function(params) {
  const filter = convertToSearchableRegex({ value: params.filter })

  const cursor = Contacts.find({
    isActive: true,
    $or: [
      { code: { $regex: filter } },
      { searchableName: { $regex: filter } },
      { phoneNumber: { $regex: filter } },
      { 'contactMethods.searchableValue': { $regex: filter } }
    ]
  }, {
    fields: {
      code: 1,
      name: 1,
      phoneNumber: 1,
      searchableName: 1,
      contactMethods: {
        searchableValue: 1
      }
    },
    sort: { updatedAt: -1 },
    limit: 8
  })

  return cursor.fetchAsync()
})
