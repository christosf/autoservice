import { Contacts } from '../../database'

export default Contacts.createQuery('getContactEditableFields', {
    $filter({ filters, params }) {
        filters._id = params.id
    },
    type: 1,
    name: 1,
    mobilePhone: 1,
    landlinePhone: 1,
    addresses: 1,
    tags: 1,
    email: 1,
    website: 1,
    vatNumber: 1
})
