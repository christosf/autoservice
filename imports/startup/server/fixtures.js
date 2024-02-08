import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Settings, Users } from '../../api/database'
import { CounterNamesEnum } from '../../api/counters/enums'
import { insertCounter } from '../../api/counters/methods'

Meteor.startup(async() => {
  if (Settings.find({}, { fields: { _id: 1 } }).count() === 0) {
    await Settings.insertAsync({
      version: 1,
      companyName: 'AutoService'
    })
    console.log('Default settings imported.')
  }

  if (Users.find({}, { fields: { _id: 1 } }).count() === 0) {
    await Accounts.createUserAsync({
      username: 'admin',
      password: 'admin'
    })
    console.log('Administrator account created.')
  }

  Object.values(CounterNamesEnum).forEach(async(name) => {
    try {
      // @ts-ignore
      const { inserted } = await insertCounter({ name })

      if (inserted) {
        console.log(`Counter created for '${name}'.`)
      }
    } catch (error) {
      console.error(error)
    }
  })
})
