import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Services = new Mongo.Collection('services')

Services.attachSchema(schema)

Services.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
})

export default Services
