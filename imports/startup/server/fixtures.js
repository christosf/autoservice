import { Accounts } from 'meteor/accounts-base'
import { Users, Counters } from '../../api/database'
import { CounterNamesEnum } from '../../api/counters/enums'

if (Users.find().count() === 0) {
    Accounts.createUser({
        username: 'admin',
        password: 'admin'
    })
    console.log('Administrator account created.')
}

if (Counters.find({ name: CounterNamesEnum.CONTACTS }).count() === 0) {
    Counters.insert({ name: CounterNamesEnum.CONTACTS })
}

if (Counters.find({ name: CounterNamesEnum.VEHICLES }).count() === 0) {
    Counters.insert({ name: CounterNamesEnum.VEHICLES })
}
