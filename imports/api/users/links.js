import { Users, Contacts, Vehicles } from '../database'

Users.addLinks({
    contactsAdded: {
        collection: Contacts,
        inversedBy: 'createdBy'
    },
    vehiclesAdded: {
        collection: Vehicles,
        inversedBy: 'createdBy'
    }
})
