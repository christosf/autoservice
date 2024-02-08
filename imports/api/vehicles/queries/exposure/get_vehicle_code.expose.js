import { Vehicles } from '../../../database'
import { getVehicleCodeQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getVehicleCodeQuery.expose({
  firewall: [checkLoggedIn]
})

getVehicleCodeQuery.resolve(async function(params) {
  const { type, vehicleId, sortBy, descending } = params

  const sortOrder = descending ? -1 : 1
  const reversedSortOrder = descending ? 1 : -1
  const sort = {}
  const reversedSort = {}

  switch (sortBy) {
    case 'make':
      sort.searchableMake = sortOrder
      sort.searchableModel = 1
      sort.updatedAt = -1
      reversedSort.searchableMake = reversedSortOrder
      reversedSort.searchableModel = 1
      reversedSort.updatedAt = -1
      break
    case 'model':
      sort.searchableModel = sortOrder
      sort.updatedAt = -1
      reversedSort.searchableModel = reversedSortOrder
      reversedSort.updatedAt = -1
      break
    default:
      sort[sortBy] = sortOrder
      reversedSort[sortBy] = reversedSortOrder
  }

  const cursor = Vehicles.rawCollection().aggregate([
    {
      $setWindowFields: {
        sortBy: sort,
        output: {
          prevCode: {
            $first: '$code',
            window: {
              documents: [-1, 0]
            }
          },
          nextCode: {
            $last: '$code',
            window: {
              documents: [0, 1]
            }
          }
        }
      }
    },
    {
      $match: {
        _id: vehicleId
      }
    },
    {
      $project: {
        code: 1,
        prevCode: 1,
        nextCode: 1
      }
    }
  ])

  const result = await cursor.next()
  cursor.close()

  if (type === 'prev' && result.code === result.prevCode) {
    result.prevCode = await Vehicles.findOneAsync({}, { fields: { code: 1 }, sort: reversedSort }).code
  } else if (type === 'next' && result.code === result.nextCode) {
    result.nextCode = await Vehicles.findOneAsync({}, { fields: { code: 1 }, sort }).code
  }

  return new Array(type === 'prev' ? result.prevCode : result.nextCode)
})
