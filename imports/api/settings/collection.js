import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Settings = new Mongo.Collection('settings')

Settings.attachSchema(schema)

Settings.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

if (Meteor.isServer) {
    Settings.createIndex({ 'contactTags.value': 1 }, {
        name: 'contactTagsValueIndex',
        unique: true
    })
}


export default Settings
