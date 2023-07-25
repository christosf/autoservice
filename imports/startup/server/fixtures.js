import { Accounts } from 'meteor/accounts-base'
import { Log } from 'meteor/logging'
import { Users, Counters, Settings } from '../../api/database'
import { CounterNamesEnum } from '../../api/counters/enums'

if (Users.find().count() === 0) {
  Accounts.createUser({
    username: 'admin',
    password: 'admin'
  })
  Log.info('Administrator account created.')
}

if (Settings.find().count() === 0) {
  Settings.insert({
    contactTags: []
  })
}

if (Counters.find({ name: CounterNamesEnum.CONTACTS }).count() === 0) {
  Counters.insert({ name: CounterNamesEnum.CONTACTS })
}

if (Counters.find({ name: CounterNamesEnum.VEHICLES }).count() === 0) {
  Counters.insert({ name: CounterNamesEnum.VEHICLES })
}

if (Counters.find({ name: CounterNamesEnum.SERVICES }).count() === 0) {
  Counters.insert({ name: CounterNamesEnum.SERVICES })
}

if (Counters.find({ name: CounterNamesEnum.PARTS }).count() === 0) {
  Counters.insert({ name: CounterNamesEnum.PARTS })
}
