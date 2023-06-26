import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import baseSchema from '../core/schemas/base-schema'
import contactSchema from './schema'
import tagsSchema from '../core/schemas/tags-schema'

const Contacts = new Mongo.Collection('contacts')
const ContactsQueue = new Queue()

Contacts.attachSchema(baseSchema)
Contacts.attachSchema(contactSchema)
Contacts.attachSchema(tagsSchema)

Contacts.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

if (Meteor.isServer) {
    Contacts.createIndex({ code: 1 }, {
        name: 'codeIndex',
        unique: true
    })
    
    Contacts.createIndex({ name: 1, phoneNumber: 1 }, {
        name: 'namePhoneNumberIndex',
        unique: true
    })

    Contacts.createIndex({ name: 1 }, { name: 'nameIndex' })

    Contacts.createIndex({ phoneNumber: 1 }, { name: 'phoneNumberIndex' })

    Contacts.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export { Contacts as default, ContactsQueue }
