import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import baseSchema from '../core/schemas/base-schema'
import tagsSchema from '../core/schemas/tags-schema'
import contactSchema from './schema'

const Contacts = new Mongo.Collection('contacts')
const ContactsQueue = new Queue()

Contacts.attachSchema(baseSchema)
Contacts.attachSchema(tagsSchema)
Contacts.attachSchema(contactSchema)

Contacts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

if (Meteor.isServer) {
  Contacts.createIndex({ code: 1 }, {
    name: 'codeIndex',
    unique: true
  })

  Contacts.createIndex({ searchableName: 1, phoneNumber: 1 }, {
    name: 'searchableNamePhoneNumberIndex',
    unique: true
  })

  Contacts.createIndex({ searchableName: 1 }, { name: 'searchableNameIndex' })
  Contacts.createIndex({ phoneNumber: 1 }, { name: 'phoneNumberIndex' })
  Contacts.createIndex({ vehicleCount: 1 }, { name: 'vehicleCountIndex' })
  Contacts.createIndex({ createdAt: 1 }, { name: 'createdAtIndex' })
  Contacts.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })

  Contacts.createIndex({ searchableTags: 1 }, {
    name: 'searchableTagsIndex',
    sparse: true
  })

  Contacts.createIndex({ 'contactMethods.searchableValue': 1 }, {
    name: 'contactMethodsSearchableValueIndex',
    sparse: true
  })
}

export { Contacts as default, ContactsQueue }
