import { Contacts } from '../../database'

export default Contacts.createQuery('getContact', {
    $filter({ filters, params }) {
        if (params.code) {
            filters.code = params.code.toUpperCase()
        }
        if (params.id) {
            filters._id = params.id
        }
    },
    code: 1,
    type: 1,
    name: 1,
    mobilePhone: 1,
    landlinePhone: 1,
    addresses: 1,
    email: 1,
    website: 1,
    vatNumber: 1,
    notes: 1,
    balance: 1,
    vehiclesCount: 1,
    active: 1,
    createdAt: 1,
    updatedAt: 1,
    addedBy: {
        username: 1
    },
    vehicles: {
        code: 1,
        make: 1,
        model: 1,
        regNumber: 1,
        vinNumber: 1,
    }
})