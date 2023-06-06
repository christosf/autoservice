import { Users, Contacts, Vehicles } from '../database'

Users.addLinks({
    contactsAdded: {
        collection: Contacts,
        inversedBy: 'addedBy'
    },
    vehiclesAdded: {
        collection: Vehicles,
        inversedBy: 'addedBy'
    }
})
