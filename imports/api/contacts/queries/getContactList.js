import { Contacts } from '../../database'
import { convertToSearchableRegex } from '../../core/functions'

export default Contacts.createQuery('getContactList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = convertToSearchableRegex(params.filter)

        filters.isActive = true
        if (params.statusFilter === 'deactivated') {
            filters.isActive = false
        } else if (params.statusFilter === 'customers') {
            filters.vehicleCount = { $gt: 0 }
        } else if (params.statusFilter === 'suppliers') {
            // TODO: Filter contacts if they have PartSupplies.
        }

        filters.$or = [
            { code: { $regex: params.filter }},
            { searchableName: { $regex: params.filter }},
            { phoneNumber: { $regex: params.filter }},
            { searchableTags: { $regex: params.filter }},
            { 'contactMethods.searchableValue': { $regex: params.filter }}
        ]

        if (params.sortBy === 'name') {
            options.sort['searchableName'] = params.descending ? -1 : 1
        } else {
            options.sort[params.sortBy] = params.descending ? -1 : 1
        }
    },
    $postFilter(results) {
        results.forEach(result => {
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
})
