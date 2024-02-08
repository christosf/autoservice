import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'
import { convertToSearchableRegex } from '../../core/utilities'

const schema = new SimpleSchema({
  filter: {
    type: String,
    defaultValue: ''
  },
  statusFilter: {
    type: String,
    optional: true
  },
  sortBy: String,
  descending: Boolean,
  limit: Number,
  skip: Number
})

const getVehicleListQuery = Vehicles.createQuery('vehicles:get_vehicle_list', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { statusFilter, sortBy } = params
    const filter = convertToSearchableRegex({ value: params.filter })
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
      { searchableTags: { $regex: filter } },
      { 'ownerCache.code': { $regex: filter } },
      { 'ownerCache.searchableName': { $regex: filter } }
    ]

    if (sortBy === 'make') {
      options.sort = {
        searchableMake: sortOrder,
        searchableModel: 1,
        updatedAt: -1
      }
    } else if (sortBy === 'model') {
      options.sort = {
        searchableModel: sortOrder,
        updatedAt: -1
      }
    } else {
      options.sort[sortBy] = sortOrder
    }
  },
  $postFilter(results) {
    results.forEach((result) => {
      delete result.ownerCache
      delete result.searchableMake
      delete result.searchableModel
      delete result.searchableMakeModel
      delete result.searchableTags
    })
    return results
  },
  $paginate: true,
  _id: 1,
  code: 1,
  make: 1,
  model: 1,
  regNumber: 1,
  chassisNumber: 1,
  tags: 1,
  isActive: 1,
  updatedAt: 1,
  owner: {
    _id: 1,
    code: 1,
    name: 1
  },
  ownerCache: {
    code: 1,
    searchableName: 1
  },
  searchableMake: 1,
  searchableModel: 1,
  searchableMakeModel: 1,
  searchableTags: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleListQuery
