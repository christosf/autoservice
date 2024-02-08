import { Meteor } from 'meteor/meteor'
import { Contacts, Users, HistoryLog, Vehicles } from '../database'

Contacts.addLinks({
  createdBy: {
    collection: Users,
    type: 'one',
    field: 'createdById'
  }
})

Meteor.startup(() => {
  Contacts.addLinks({
    vehicles: {
      collection: Vehicles,
      inversedBy: 'owner',
      denormalize: {
        body: {
          _id: 1,
          regNumber: 1
        },
        field: 'vehiclesCache'
      }
    },
    history: {
      collection: HistoryLog,
      inversedBy: 'contact',
      autoremove: true
    }
  })
})
