import { Mongo } from 'meteor/mongo'
import schema from './schema'

const Parts = new Mongo.Collection('parts')

Parts.attachSchema(schema)

Parts.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
})

if (Meteor.isServer) {
    Parts.createIndex({ code: 1 }, {
        name: 'codeIndex',
        unique: true
    })

    Parts.createIndex({ name: 1 }, {
        name: 'nameIndex',
        unique: true
    })

    Parts.createIndex({ updatedAt: 1 }, { name: 'updatedAtIndex' })
}

export default Parts
