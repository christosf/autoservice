import SimpleSchema from 'simpl-schema'
import { Contacts } from '../../database'
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

const getContactListQuery = Contacts.createQuery('contacts:get_contact_list', {
  $filter({ filters, options, params }) {
    options.sort = {}

    const { statusFilter, sortBy } = params
    const filter = convertToSearchableRegex({ value: params.filter })
    const sortOrder = params.descending ? -1 : 1

    filters.isActive = true
    if (statusFilter === 'deactivated') {
      filters.isActive = false
    } else if (statusFilter === 'customers') {
      filters.vehicleCount = { $gt: 0 }
    } else if (statusFilter === 'suppliers') {
      // TODO: Filter contacts if they have PurchaseOrders.
    }

    filters.$or = [
      { code: { $regex: filter } },
      { phoneNumber: { $regex: filter } },
      { searchableName: { $regex: filter } },
      { searchableTags: { $regex: filter } },
      { 'contactMethods.searchableValue': { $regex: filter } },
      { 'vehiclesCache.regNumber': { $regex: filter } }
    ]

    if (sortBy === 'name') {
      options.sort = {
        searchableName: sortOrder,
        updatedAt: -1
      }
    } else {
      options.sort[sortBy] = sortOrder
    }
  },
  $postFilter(results) {
    results.forEach((result) => {
      delete result.contactMethods
      delete result.searchableName
      delete result.searchableTags
      delete result.vehiclesCache
    })
    return results
  },
  $paginate: true,
  _id: 1,
  code: 1,
  type: 1,
  name: 1,
  phoneNumber: 1,
  tags: 1,
  vehicleCount: 1,
  isActive: 1,
  updatedAt: 1,
  contactMethods: {
    searchableValue: 1
  },
  searchableName: 1,
  searchableTags: 1,
  vehiclesCache: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getContactListQuery
