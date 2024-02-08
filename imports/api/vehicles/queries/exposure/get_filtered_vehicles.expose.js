import { Vehicles } from '../../../database'
import { checkLoggedIn } from '../../../users/utilities'
import { convertToSearchableRegex } from '../../../core/utilities'
import { getFilteredVehiclesQuery } from '../index'

getFilteredVehiclesQuery.expose({
  firewall: [checkLoggedIn]
})

getFilteredVehiclesQuery.resolve(async function(params) {
  const filter = convertToSearchableRegex({ value: params.filter })

  const cursor = Vehicles.find({
    isActive: true,
    'ownerCache.isActive': true,
    $or: [
      { code: { $regex: filter } },
      { searchableMakeModel: { $regex: filter } },
      { regNumber: { $regex: filter } },
      { chassisNumber: { $regex: filter } },
      { 'ownerCache.code': { $regex: filter } },
      { 'ownerCache.searchableName': { $regex: filter } },
      { 'ownerCache.phoneNumber': { $regex: filter } }
    ]
  }, {
    fields: {
      code: 1,
      makeModel: 1,
      searchableMakeModel: 1,
      regNumber: 1,
      chassisNumber: 1,
      ownerId: 1,
      ownerCache: 1
    },
    sort: { updatedAt: -1 },
    limit: 8
  })

  return cursor.fetchAsync()
})
