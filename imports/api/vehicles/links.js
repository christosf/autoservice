import { Vehicles, Users, Contacts } from '../database'

Vehicles.addLinks({
    addedBy: {
        collection: Users,
        type: 'one',
        field: 'addedById'
    },
    owner: {
        collection: Contacts,
        type: 'one',
        field: 'ownerId'
    }
})
