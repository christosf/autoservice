import { Contacts, Users, Vehicles } from '../database'

Contacts.addLinks({
    createdBy: {
        collection: Users,
        type: 'one',
        field: 'createdById'
    }
})

Contacts.addLinks({
    vehicles: {
        collection: Vehicles,
        inversedBy: 'owner'
    }
})
