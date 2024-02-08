import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { Contacts } from '../../database'
import { ContactsQueue } from '../collection'
import { ContactMethodTypesEnum } from '../enums'
import { increaseCounter } from '../../counters/methods'
import { CounterNamesEnum } from '../../counters/enums'
import { checkLoggedIn } from '../../users/utilities'

const insertContact = createMethod({
  name: 'contacts:insert',

  schema: new SimpleSchema({
    contact: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ contact }) {
    const task = ContactsQueue.add(async() => {
      // Generate unique contact code.
      contact.code = `C${await increaseCounter({ name: CounterNamesEnum.CONTACTS })}`

      // Remove contact method if it is the same as the main phone number.
      contact.contactMethods.forEach((method, index) => {
        if (method.type === ContactMethodTypesEnum.PHONE && method.value === contact.phoneNumber) {
          contact.contactMethods.splice(index, 1)
        }
      })

      return { _id: await Contacts.insertAsync(contact), code: contact.code }
    })

    return task.promise
  }
})

export default insertContact
