import { Contacts } from '../../database'

export default Contacts.createQuery('getContactList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        filters.active = true
        if (params.customFilter === 'deactivated') {
            filters.active = false
        } else if (params.customFilter === 'customers') {
            filters.vehiclesCount = { $gt: 0 }
        } else if (params.customFilter === 'suppliers') {
            // TODO: Filter contacts if they have PartSupplies.
        }

        filters.$or = [
            { code: { $regex: params.filter, $options : 'i' }},
            { name: { $regex: params.filter, $options : 'i' }},
            { mobilePhone: { $regex: params.filter, $options : 'i' }},
            { landlinePhone: { $regex: params.filter, $options : 'i' }}
        ]

        options.sort[params.sortBy] = params.descending ? 1 : -1
    },
    $paginate: true,
    code: 1,
    name: 1,
    type: 1,
    mobilePhone: 1,
    landlinePhone: 1,
    vehiclesCount: 1,
    active: 1,
    updatedAt: 1
})
