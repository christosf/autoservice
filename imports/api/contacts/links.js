import { Contacts, Users, HistoryLog, Vehicles } from '../database'

Contacts.addLinks({
    createdBy: {
        collection: Users,
        type: 'one',
        field: 'createdById'
    },
    history: {
        collection: HistoryLog,
        inversedBy: 'contact',
        autoremove: true
    },
    vehicles: {
        collection: Vehicles,
        inversedBy: 'owner'
    }
})
