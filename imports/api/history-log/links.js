import { HistoryLog, Users, Contacts } from '../database'

HistoryLog.addLinks({
    createdBy: {
        collection: Users,
        type: 'one',
        field: 'createdById'
    },
    contact: {
        collection: Contacts,
        type: 'one',
        field: 'contactId'
    }
})
