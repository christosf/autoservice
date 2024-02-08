import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const countContacts = createMethod({
  name: 'contacts:count',

  schema: new SimpleSchema({

  }),

  before: [checkLoggedIn],

  async run(params) {
    // @ts-ignore
    return Contacts.countDocuments(params)
  }
})

export default countContacts
