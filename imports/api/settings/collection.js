import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Settings = new Mongo.Collection('settings')

Settings.attachSchema(schema)

Settings.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
})

export default Settings
