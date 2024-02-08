import { Contacts } from '../../../database'
import { getContactCodeQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'

getContactCodeQuery.expose({
  firewall: [checkLoggedIn]
})

getContactCodeQuery.resolve(async function(params) {
  const { type, contactId, sortBy, descending } = params

  const sortOrder = descending ? -1 : 1
  const reversedSortOrder = descending ? 1 : -1
  const sort = {}
  const reversedSort = {}

  switch (sortBy) {
    case 'name':
      sort.searchableName = sortOrder
      sort.updatedAt = -1
      reversedSort.searchableName = reversedSortOrder
      reversedSort.updatedAt = -1
      break
    default:
      sort[sortBy] = sortOrder
      reversedSort[sortBy] = reversedSortOrder
  }

  const cursor = Contacts.rawCollection().aggregate([
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
        _id: contactId
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
    result.prevCode = await Contacts.findOneAsync({}, { fields: { code: 1 }, sort: reversedSort }).code
  } else if (type === 'next' && result.code === result.nextCode) {
    result.nextCode = await Contacts.findOneAsync({}, { fields: { code: 1 }, sort }).code
  }

  return new Array(type === 'prev' ? result.prevCode : result.nextCode)
})
