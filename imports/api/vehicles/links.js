import { Meteor } from 'meteor/meteor'
import { Vehicles, Users, Contacts, HistoryLog } from '../database'

Vehicles.addLinks({
  owner: {
    collection: Contacts,
    type: 'one',
    field: 'ownerId',
    denormalize: {
      body: {
        _id: 1,
        code: 1,
        name: 1,
        searchableName: 1,
        phoneNumber: 1,
        isActive: 1
      },
      field: 'ownerCache'
    }
  },
  createdBy: {
    collection: Users,
    type: 'one',
    field: 'createdById'
  }
})

Meteor.startup(() => {
  Vehicles.addLinks({
    history: {
      collection: HistoryLog,
      inversedBy: 'vehicle',
      autoremove: true
    }
  })
})
