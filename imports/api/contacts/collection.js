import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Contacts = new Mongo.Collection('contacts')

Contacts.attachSchema(schema)

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
    
    Contacts.createIndex({ name: 1, mobilePhone: 1 }, {
        name: 'nameMobilePhoneIndex',
        unique: true,
        sparse: true
    })
    
    Contacts.createIndex({ name: 1, landlinePhone: 1 }, {
        name: 'nameLandlinePhoneIndex',
        unique: true,
        sparse: true
    })

    Contacts.createIndex({ name: 1 }, { name: 'nameIndex' })

    Contacts.createIndex({ mobilePhone: 1 }, { name: 'mobilePhoneIndex', sparse: true })
    
    Contacts.createIndex({ landlinePhone: 1 }, { name: 'landlinePhoneIndex', sparse: true })

    Contacts.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export default Contacts
