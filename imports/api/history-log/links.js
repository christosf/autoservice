import { HistoryLog, Users, Contacts, Vehicles } from '../database'

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
  },
  vehicle: {
    collection: Vehicles,
    type: 'one',
    field: 'vehicleId'
  }
})
