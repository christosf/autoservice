import { Meteor } from 'meteor/meteor'
import '../../api/database'
import '../../api/exposures'
import './methods'
import './hooks'
import './observers'
import './fixtures'

Meteor.startup(() => {
    // migrations
    /*
    const ids = []
    Contacts.find({}, { fields: { _id: 1 }}).map(contact => {
        ids.push(contact._id)
    })

    Contacts.update({ _id: { $in: ids }}, { $unset: { balance: 1 }}, { multi: true })

    console.log(ids)
    */
})
