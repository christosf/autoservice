import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import codeSchema from '../core/schemas/code'
import timestampSchema from '../core/schemas/timestamp'
import isActiveSchema from '../core/schemas/is_active'
import tagsSchema from '../core/schemas/tags'
import contactSchema from './schema'

const Contacts = new Mongo.Collection('contacts', { defineMutationMethods: false })
const ContactsQueue = new Queue()

Contacts.attachSchema(codeSchema)
Contacts.attachSchema(timestampSchema)
Contacts.attachSchema(isActiveSchema)
Contacts.attachSchema(tagsSchema)
Contacts.attachSchema(contactSchema)

if (Meteor.isServer) {
  Contacts.createIndexAsync({ code: 1 }, {
    name: 'codeIndex',
    unique: true
  })

  Contacts.createIndexAsync({ searchableName: 1, phoneNumber: 1 }, {
    name: 'searchableNamePhoneNumberIndex',
    unique: true
  })

  Contacts.createIndexAsync({ searchableTags: 1 }, {
    name: 'searchableTagsIndex',
    sparse: true
  })

  Contacts.createIndexAsync({ 'contactMethods.searchableValue': 1 }, {
    name: 'contactMethodsSearchableValueIndex',
    sparse: true
  })

  Contacts.createIndexAsync({ type: 1 }, { name: 'typeIndex' })
  Contacts.createIndexAsync({ phoneNumber: 1 }, { name: 'phoneNumberIndex' })
  Contacts.createIndexAsync({ searchableName: 1 }, { name: 'searchableNameIndex' })
  Contacts.createIndexAsync({ vehicleCount: 1 }, { name: 'vehicleCountIndex' })

  Contacts.createIndexAsync({ createdById: 1 }, { name: 'createdByIdIndex' })
  Contacts.createIndexAsync({ createdAt: 1 }, { name: 'createdAtIndex' })
  Contacts.createIndexAsync({ updatedAt: 1 }, { name: 'updatedAtIndex' })
  Contacts.createIndexAsync({ isActive: 1 }, { name: 'isActiveIndex' })
}

export { Contacts as default, ContactsQueue }
