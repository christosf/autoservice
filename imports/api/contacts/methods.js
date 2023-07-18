import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import SimpleSchema from 'simpl-schema'

import { Contacts } from '../database'
import { ContactsQueue } from './collection'
import { CounterNamesEnum } from '../counters/enums'
import { contactHasUpdates } from './functions'
import { convertToSearchableRegex, convertToSearchableString } from '../core/functions'

Meteor.methods({
  'contacts.insert'(params) {
    check(params, Object)

    const task = ContactsQueue.add(() => {
      const contact = { ...params }

      contact.code = `C${Meteor.call('counters.increaseCounter', { name: CounterNamesEnum.CONTACTS })}`

      contact.contactMethods.forEach((method, index) => {
        if (method.value === contact.phoneNumber) {
          contact.contactMethods.splice(index, 1)
        }
      })
      if (Object.keys(contact.billingAddress).length === 0) {
        delete contact.billingAddress
      }
      if (Object.keys(contact.deliveryAddress).length === 0) {
        delete contact.deliveryAddress
      }

      const _id = Contacts.insert(contact)

      return {
        added: !!_id,
        _id,
        code: contact.code
      }
    })

    return task.promise
  },
  'contacts.update'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      contactId: String,
      contact: {
        type: Object,
        blackbox: true
      }
    })
    schema.validate(schema.clean(params))

    const { contactId, contact } = params

    contact.contactMethods.forEach((method, index) => {
      if (method.value === contact.phoneNumber) {
        contact.contactMethods.splice(index, 1)
      }
    })

    if (!contactHasUpdates({ contactId, updated: contact })) {
      throw new Meteor.Error('no-updated-fields')
    }

    const fieldsToSet = {}
    const fieldsToUnset = {}
    Object.keys(contact).forEach((field) => {
      if (
        (typeof contact[field] === 'string' && contact[field] === '')
        || (
          typeof contact[field] === 'object'
          && !Array.isArray(contact[field])
          && Object.keys(contact[field]).length === 0
        )
      ) {
        fieldsToUnset[field] = ''
      } else if (
        typeof contact[field] === 'object'
        && !Array.isArray(contact[field])
      ) {
        Object.keys(contact[field]).forEach((insideField) => {
          if (contact[field][insideField] === '') {
            delete contact[field][insideField]
          }
        })
        if (Object.keys(contact[field]).length === 0) {
          fieldsToUnset[field] = ''
        } else {
          fieldsToSet[field] = contact[field]
        }
      } else {
        fieldsToSet[field] = contact[field]
      }
    })
    fieldsToSet.updatedAt = new Date()

    return {
      updated: Contacts.update(contactId, { $set: fieldsToSet, $unset: fieldsToUnset }) === 1
    }
  },
  'contacts.delete'(params) {
    check(params, Object)

    const schema = new SimpleSchema({ contactId: String })
    schema.validate(schema.clean(params))

    const { contactId } = params

    const linkedVehicles = Contacts.getLink(contactId, 'vehicles')
    const vehicleCount = linkedVehicles.find({}, { fields: { _id: 1 } }).count()

    if (vehicleCount > 0) {
      throw new Meteor.Error('associated-vehicles')
    }

    return { deleted: Contacts.remove(contactId) === 1 }
  },
  'contacts.deactivate'(params) {
    check(params, Object)

    const schema = new SimpleSchema({ contactId: String })
    schema.validate(schema.clean(params))

    const { contactId } = params

    return { deactivated: Contacts.update(contactId, { $set: { isActive: false } }) === 1 }
  },
  'contacts.activate'(params) {
    check(params, Object)

    const schema = new SimpleSchema({ contactId: String })
    schema.validate(schema.clean(params))

    const { contactId } = params

    return { activated: Contacts.update(contactId, { $set: { isActive: true } }) === 1 }
  },
  'contacts.updateNotes'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      contactId: String,
      notes: {
        type: String,
        optional: true
      }
    })
    schema.validate(schema.clean(params))

    const { contactId, notes } = params

    return {
      updated: Contacts.update(
        contactId,
        notes
          ? { $set: { notes, updatedAt: new Date() } }
          : { $unset: { notes }, $set: { updatedAt: new Date() } }
      ) === 1
    }
  },
  'contacts.contactExists'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      name: String,
      phoneNumber: {
        type: String,
        defaultValue: ''
      },
      excludeId: {
        type: String,
        optional: true
      }
    })
    schema.validate(schema.clean(params))

    const { name, phoneNumber, excludeId } = params

    const query = {
      searchableName: convertToSearchableString(name),
      phoneNumber
    }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    return !!Contacts.findOne(query, { fields: { _id: 1 } })
  },
  'contacts.filterContacts'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      filter: String
    })
    schema.validate(schema.clean(params))

    const filter = convertToSearchableRegex(params.filter)

    const cursor = Contacts.find({
      isActive: true,
      $or: [
        { code: { $regex: filter } },
        { searchableName: { $regex: filter } },
        { phoneNumber: { $regex: filter } },
        { 'contactMethods.searchableValue': { $regex: filter } }
      ]
    }, {
      fields: {
        code: 1,
        type: 1,
        name: 1,
        phoneNumber: 1,
        searchableName: 1,
        contactMethods: {
          searchableValue: 1
        }
      },
      limit: 8
    })

    return cursor.fetch()
  },
  async 'contacts.getDistinctFieldValues'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      field: String,
      filter: {
        type: String,
        defaultValue: ''
      }
    })
    schema.validate(schema.clean(params))

    const { field } = params

    const searchableField = () => {
      switch (field) {
        case 'name': return 'searchableName'
        case 'tags': return 'searchableTags'
        case 'contactMethods.value': return 'contactMethods.searchableValue'
        default: return field
      }
    }

    const filter = convertToSearchableRegex(params.filter)
    const query = {}

    query[searchableField()] = { $regex: filter }

    const response = await Contacts.rawCollection().distinct(field, query)

    return response.filter((item) => new RegExp(filter).test(convertToSearchableString(item)))
  },
  'contacts.getPrevNextContactCode'(params) {
    check(params, Object)

    const schema = new SimpleSchema({
      type: {
        type: String,
        allowedValues: ['prev', 'next']
      },
      value: String,
      sortBy: String,
      descending: Boolean
    })
    schema.validate(schema.clean(params))

    const { type, value, sortBy, descending } = params

    const query = {}
    query[sortBy] = descending ? { $lt: value } : { $gt: value }
    if (type === 'prev') {
      query[sortBy] = descending ? { $gt: value } : { $lt: value }
    }

    const sort = {}
    if (sortBy === 'name') {
      sort.searchableName = descending ? -1 : 1
    } else {
      sort[sortBy] = descending ? -1 : 1
    }
    if (type === 'prev') {
      if (sortBy === 'name') {
        sort.searchableName = descending ? 1 : -1
      } else {
        sort[sortBy] = descending ? 1 : -1
      }
    }

    const contact = Contacts.findOne(
      query,
      { fields: { code: 1 }, sort }
    )

    if (!contact) {
      return Contacts.findOne({}, { fields: { code: 1 }, sort }).code
    }

    return contact.code
  },
  'contacts.getBasicDetails'(params) {
    check(params, Object)

    const schema = new SimpleSchema({ contactId: String })
    schema.validate(schema.clean(params))

    const { contactId } = params

    return Contacts.findOne(contactId, { fields: { code: 1, name: 1 } })
  }
})
