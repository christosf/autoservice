import { Contacts, Users, Vehicles } from '../database'

Contacts.addLinks({
    addedBy: {
        collection: Users,
        type: 'one',
        field: 'addedById'
    }
})

Contacts.addLinks({
    vehicles: {
        collection: Vehicles,
        inversedBy: 'owner'
    }
})
