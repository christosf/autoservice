import { Mongo } from 'meteor/mongo'

const Settings = new Mongo.Collection('settings', { defineMutationMethods: false })

export default Settings
