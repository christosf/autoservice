import { Contacts } from '../../database'

export default Contacts.createQuery('getContactList', {
    $filter({ filters, options, params }) {
        options.sort = {}

        params.filter = params.filter.replace(/([()[{*+.$^\\|?])/g, '\\$1').toUpperCase()

        filters.isActive = true
        if (params.statusFilter === 'deactivated') {
            filters.isActive = false
        } else if (params.statusFilter === 'customers') {
            filters.vehiclesCount = { $gt: 0 }
        } else if (params.statusFilter === 'suppliers') {
            // TODO: Filter contacts if they have PartSupplies.
        }

        filters.$or = [
            { code: { $regex: params.filter, $options: 'i' }},
            { name: { $regex: params.filter, $options: 'i' }},
            { phoneNumber: { $regex: params.filter, $options: 'i' }},
            { tags: { $regex: params.filter, $options: 'i' }},
            { 'contactMethods.value': { $regex: params.filter, $options: 'i' }}
        ]

        options.sort[params.sortBy] = params.descending ? 1 : -1
    },
    $paginate: true,
    code: 1,
    name: 1,
    type: 1,
    phoneNumber: 1,
    tags: 1,
    contactMethods: 1,
    vehiclesCount: 1,
    isActive: 1,
    updatedAt: 1
})
