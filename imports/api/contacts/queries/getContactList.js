import { Contacts } from '../../database'
import { convertToSearchableRegex } from '../../core/functions'

export default Contacts.createQuery('getContactList', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { statusFilter, sortBy } = params
    const filter = convertToSearchableRegex(params.filter)
    const sortOrder = params.descending ? -1 : 1

    filters.isActive = true
    if (statusFilter === 'deactivated') {
      filters.isActive = false
    } else if (statusFilter === 'customers') {
      filters.vehicleCount = { $gt: 0 }
    } else if (statusFilter === 'suppliers') {
      // TODO: Filter contacts if they have PartSupplies.
    }

    filters.$or = [
      { code: { $regex: filter } },
      { searchableName: { $regex: filter } },
      { phoneNumber: { $regex: filter } },
      { searchableTags: { $regex: filter } },
      { 'contactMethods.searchableValue': { $regex: filter } }
    ]

    if (sortBy === 'name') {
      options.sort.searchableName = sortOrder
      options.sort.updatedAt = -1
    } else {
      options.sort[sortBy] = sortOrder
    }
  },
  $postFilter(results) {
    results.forEach((result) => {
      delete result.contactMethods
      delete result.searchableName
      delete result.searchableTags
    })
    return results
  },
  $paginate: true,
  code: 1,
  name: 1,
  type: 1,
  phoneNumber: 1,
  tags: 1,
  vehicleCount: 1,
  isActive: 1,
  updatedAt: 1,
  contactMethods: {
    searchableValue: 1
  },
  searchableName: 1,
  searchableTags: 1
}, {
  validateParams: {
    filter: String,
    statusFilter: String,
    sortBy: String,
    descending: Boolean,
    limit: Number,
    skip: Number
  }
})
