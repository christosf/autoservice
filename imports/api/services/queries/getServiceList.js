import { Services } from '../../database'

export default Services.createQuery('getServiceList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        filters.active = true
        if (params.statusFilter === 'deactivated') {
            filters.active = false
        }

        filters.$or = [
            { code: { $regex: params.filter, $options : 'i' }},
            { name: { $regex: params.filter, $options : 'i' }},
            { tags: { $regex: params.filter, $options : 'i' }}
        ]

        options.sort[params.sortBy] = params.descending ? 1 : -1
    },
    $paginate: true,
    code: 1,
    name: 1,
    description: 1,
    ratePerHour: 1,
    hours: 1,
    tags: 1,
    noVat: 1,
    active: 1,
    updatedAt: 1
})
