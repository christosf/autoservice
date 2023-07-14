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
    phoneNumber: 1,
    tags: 1,
    billingAddress: 1,
    deliveryAddress: 1,
    taxRegNumber: 1,
    contactMethods: {
        type: 1,
        value: 1,
        description: 1
    },
    notes: 1,
    balance: 1,
    vehicleCount: 1,
    isActive: 1,
    createdAt: 1,
    updatedAt: 1,
    createdBy: {
        username: 1
    },
    vehicles: {
        $filters: {
            isActive: true
        },
        code: 1,
        make: 1,
        model: 1,
        regNumber: 1,
        tags: 1,
        updatedAt: 1
    }
})
