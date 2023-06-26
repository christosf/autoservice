import { Contacts } from '../../database'

export default Contacts.createQuery('getContactExport', {
    _id: 1,
    code: 1,
    type: 1,
    name: 1,
    mobilePhone: 1,
    landlinePhone: 1,
    addresses: 1,
    tags: 1,
    email: 1,
    website: 1,
    taxRegNumber: 1,
    notes: 1,
    isActive: 1,
    createdBy: {
        _id: 1,
        username: 1
    },
    createdAt: 1,
    updatedAt: 1
})
