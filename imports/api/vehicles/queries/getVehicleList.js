import { Vehicles } from '../../database'
import { convertToSearchableRegex } from '../../core/functions'
// TODO: Validate params
export default Vehicles.createQuery('getVehicleList', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { statusFilter, sortBy } = params
    const filter = convertToSearchableRegex(params.filter)
    const sortOrder = params.descending ? -1 : 1

    filters.isActive = true
    if (statusFilter === 'deactivated') {
      filters.isActive = false
    }

    filters.$or = [
      { code: { $regex: filter } },
      { searchableMakeModel: { $regex: filter } },
      { regNumber: { $regex: filter } },
      { chassisNumber: { $regex: filter } },
      { searchableTags: { $regex: filter } }
    ]

    if (sortBy === 'make') {
      options.sort.searchableMake = sortOrder
      options.sort.searchableModel = 1
      options.sort.updatedAt = -1
    } else if (sortBy === 'model') {
      options.sort.searchableModel = sortOrder
      options.sort.updatedAt = -1
    } else {
      options.sort[sortBy] = sortOrder
    }
  },
  $postFilter(results) {
    results.forEach((result) => {
      delete result.searchableMake
      delete result.searchableModel
      delete result.searchableMakeModel
      delete result.searchableTags
    })
    return results
  },
  $paginate: true,
  code: 1,
  make: 1,
  model: 1,
  regNumber: 1,
  chassisNumber: 1,
  tags: 1,
  owner: {
    code: 1,
    name: 1
  },
  isActive: 1,
  updatedAt: 1,
  searchableMake: 1,
  searchableModel: 1,
  searchableMakeModel: 1,
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
