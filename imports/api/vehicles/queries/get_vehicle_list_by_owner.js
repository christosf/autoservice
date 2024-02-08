import SimpleSchema from 'simpl-schema'
import { Vehicles } from '../../database'

// TODO: Check if it is good.

const schema = new SimpleSchema({
  ownerId: String,
  sortBy: String,
  descending: Boolean,
  limit: Number,
  skip: Number
})

const getVehicleListByOwnerQuery = Vehicles.createQuery('vehicles:get_vehicle_list_by_owner', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { sortBy } = params
    const sortOrder = params.descending ? -1 : 1

    filters.isActive = true
    filters.ownerId = params.ownerId

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
      delete result.searchableMake
      delete result.searchableModel
    })
    return results
  },
  $paginate: true,
  _id: 1,
  ownerId: 1,
  code: 1,
  make: 1,
  model: 1,
  regNumber: 1,
  chassisNumber: 1,
  tags: 1,
  isActive: 1,
  updatedAt: 1,
  searchableMake: 1,
  searchableModel: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getVehicleListByOwnerQuery
