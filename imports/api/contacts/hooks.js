import { Meteor } from 'meteor/meteor'
import { diff } from 'just-diff'
import objectPath from 'object-path'

import { Contacts } from '../database'
import { HistoryLogTypesEnum } from '../history-log/enums'

const allowedFields = [
    'type',
    'name',
    'phoneNumber',
    'billingAddress',
    'deliveryAddress',
    'taxRegNumber',
    'tags',
    'contactMethods',
    'notes'
]

const addInsertToHistory = (_userId, contact) => {
    const prev = { tags: [], contactMethods: [] }
    const rawChanges = diff(prev, contact)
    const changeList = new Array()

    rawChanges.forEach(change => {
        const { op, path, value } = change

        if (allowedFields.includes(path[0])) {
            changeList.push({ op, path, value })   
        }
    })

    if (changeList.length === 0) {
        return
    }
    
    Meteor.call('history_log.insert', {
        type: HistoryLogTypesEnum.INSERT,
        metadata: { changeList },
        contactId: contact._id,
        createdById: contact.createdById,
        createdAt: contact.createdAt
    })
}

const addUpdateToHistory = function(userId, contact) {
    const prev = this.previous
    const rawChanges = diff(prev, contact)
    const changeList = new Array()

    rawChanges.forEach(change => {
        const { op, path, value } = change
        const oldValue = objectPath.get(prev, path.join('.'))

        if (allowedFields.includes(path[0]) || path[0] === 'isActive') {
            changeList.push({ op, path, value, oldValue })
        }
    })

    if (changeList.length === 0) {
        return
    }

    if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && changeList[0].value) {
        Meteor.call('history_log.insert', {
            type: HistoryLogTypesEnum.ACTIVATION,
            contactId: contact._id,
            createdById: userId,
            createdAt: new Date()
        })
    } else if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && !changeList[0].value) {
        Meteor.call('history_log.insert', {
            type: HistoryLogTypesEnum.DEACTIVATION,
            contactId: contact._id,
            createdById: userId,
            createdAt: new Date()
        })
    } else if (changeList.length === 1 && changeList[0].path[0] === 'notes') {
        Meteor.call('history_log.insert', {
            type: HistoryLogTypesEnum.NOTES_UPDATE,
            metadata: { changeList },
            contactId: contact._id,
            createdById: userId,
            createdAt: contact.updatedAt
        })
    } else {
        Meteor.call('history_log.insert', {
            type: HistoryLogTypesEnum.UPDATE,
            metadata: { changeList },
            contactId: contact._id,
            createdById: userId,
            createdAt: contact.updatedAt
        })
    }
}

Contacts.after.insert(addInsertToHistory)
Contacts.after.update(addUpdateToHistory)
