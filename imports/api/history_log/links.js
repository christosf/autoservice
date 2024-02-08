import { HistoryLog, Users, Contacts, Vehicles, JobCards } from '../database'

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
  },
  jobCard: {
    collection: JobCards,
    type: 'one',
    field: 'jobCardId'
  }
})
