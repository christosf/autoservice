import { Vehicles } from '../../database'
import { convertToSearchableRegex } from '../../core/functions'

export default Vehicles.createQuery('getVehicleList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = convertToSearchableRegex(params.filter)

        filters.isActive = true
        if (params.statusFilter === 'deactivated') {
            filters.isActive = false
        }

        filters.$or = [
            { code: { $regex: params.filter }},
            { searchableMakeModel: { $regex: params.filter }},
            { regNumber: { $regex: params.filter }},
            { chassisNumber: { $regex: params.filter }},
            { searchableTags: { $regex: params.filter }}
        ]

        if (params.sortBy === 'make') {
            options.sort['searchableMake'] = params.descending ? -1 : 1
        } else if (params.sortBy === 'model') {
            options.sort['searchableModel'] = params.descending ? -1 : 1
        } else {
            options.sort[params.sortBy] = params.descending ? -1 : 1
        }
    },
    $postFilter(results) {
        results.forEach(result => {
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
})
