import SimpleSchema from 'simpl-schema'
import { JobCards } from '../../database'
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

const getJobCardListQuery = JobCards.createQuery('job_cards:get_job_card_list', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { statusFilter, sortBy } = params
    const filter = convertToSearchableRegex({ value: params.filter })
    const sortOrder = params.descending ? -1 : 1

    /*
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
    */
  },
  /*
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
  */
  $paginate: true,
  _id: 1,
  code: 1,
  status: 1,
  priority: 1,
  assignedTo: 1,
  dates: 1,
  startDate: 1,
  dueDate: 1,
  tags: 1,
  vehicle: {
    _id: 1,
    code: 1,
    regNumber: 1,
    makeModel: 1
  },
  owner: {
    _id: 1,
    code: 1,
    name: 1
  }
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getJobCardListQuery
