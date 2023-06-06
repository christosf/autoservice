import { Vehicles } from '../../database'

export default Vehicles.createQuery('getVehicleList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        filters.active = true
        if (params.customFilter === 'deactivated') {
            filters.active = false
        }

        filters.$or = [
            { code: { $regex: params.filter, $options : 'i' }},
            { makeModel: { $regex: params.filter, $options : 'i' }},
            { regNumber: { $regex: params.filter, $options : 'i' }},
            { chassisNumber: { $regex: params.filter, $options : 'i' }}
        ]

        options.sort[params.sortBy] = params.descending ? 1 : -1
    },
    $paginate: true,
    code: 1,
    make: 1,
    model: 1,
    makeModel: 1,
    regNumber: 1,
    chassisNumber: 1,
    owner: {
        code: 1,
        name: 1
    },
    active: 1
})
