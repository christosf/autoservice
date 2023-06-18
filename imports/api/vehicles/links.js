import { Vehicles, Users, Contacts } from '../database'

Vehicles.addLinks({
    createdBy: {
        collection: Users,
        type: 'one',
        field: 'createdById'
    },
    owner: {
        collection: Contacts,
        type: 'one',
        field: 'ownerId'
    }
})
