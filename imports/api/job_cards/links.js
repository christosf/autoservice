import { Meteor } from 'meteor/meteor'
import { Contacts, JobCards, Vehicles, Users, HistoryLog } from '../database'

JobCards.addLinks({
  vehicle: {
    collection: Vehicles,
    type: 'one',
    field: 'vehicleId',
    denormalize: {
      body: {
        _id: 1,
        code: 1,
        makeModel: 1,
        searchableMakeModel: 1,
        regNumber: 1,
        chassisNumber: 1
      },
      field: 'vehicleCache'
    }
  },
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
        phoneNumber: 1
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
  JobCards.addLinks({
    history: {
      collection: HistoryLog,
      inversedBy: 'jobCard',
      autoremove: true
    }
  })
})
