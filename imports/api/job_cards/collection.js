import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Queue } from 'queue-system'

import codeSchema from '../core/schemas/code'
import timestampSchema from '../core/schemas/timestamp'
import tagsSchema from '../core/schemas/tags'
import jobCardSchema from './schema'

const JobCards = new Mongo.Collection('job_cards', { defineMutationMethods: false })
const JobCardsQueue = new Queue()

JobCards.attachSchema(codeSchema)
JobCards.attachSchema(timestampSchema)
JobCards.attachSchema(tagsSchema)
JobCards.attachSchema(jobCardSchema)

if (Meteor.isServer) {
  // TODO: Create Indexes.
  JobCards.createIndexAsync({ code: 1 }, {
    name: 'codeIndex',
    unique: true
  })
}

export { JobCards as default, JobCardsQueue }
