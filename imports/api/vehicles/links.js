import { Vehicles, Users, Contacts, HistoryLog } from '../database'

Vehicles.addLinks({
  createdBy: {
    collection: Users,
    type: 'one',
    field: 'createdById'
  },
  history: {
    collection: HistoryLog,
    inversedBy: 'vehicle',
    autoremove: true
  },
  owner: {
    collection: Contacts,
    type: 'one',
    field: 'ownerId'
  }
})
