import objectPath from 'object-path'
import { diff } from 'just-diff'
import { Contacts } from '../database'
import { HistoryLogTypesEnum } from '../history-log/enums'

const addInsertToHistory = (_userId, contact) => {
    Meteor.call('history_log.insert', {
        type: HistoryLogTypesEnum.INSERT,
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
        if (
            change.path[0] === 'updatedAt' ||
            change.path[0] === 'searchableName' ||
            (change.path.length === 2 && change.path[1] === 'searchableValue')
        ) {
            return
        }

        changeList.push({
            op: change.op,
            path: change.path,
            value: change.value,
            oldValue: objectPath.get(prev, change.path.join('.'))
        })
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
            metadata: {
                changeList
            },
            contactId: contact._id,
            createdById: userId,
            createdAt: contact.updatedAt
        })
    } else {
        Meteor.call('history_log.insert', {
            type: HistoryLogTypesEnum.UPDATE,
            metadata: {
                changeList
            },
            contactId: contact._id,
            createdById: userId,
            createdAt: contact.updatedAt
        })
    }
}

Contacts.after.insert(addInsertToHistory)
Contacts.after.update(addUpdateToHistory)

/*
const addInsertToHistory = (_userId, contact) => {
    Contacts.update(contact._id, { $push: {
        history: {
            type: 'insert',
            createdById: contact.createdById,
            createdAt: contact.createdAt
        }
    }})
}

const addUpdateToHistory = function(userId, contact) {
    const rawChanges = diff(this.previous, contact)
    const changeList = new Array()

    rawChanges.forEach(change => {
        if (change.path[0] === 'updatedAt' || change.path[0] === 'history') {
            return
        }
        changeList.push({
            op: change.op,
            path: change.path,
            value: change.value,
            oldValue: objectPath.get(this.previous, change.path.join('.'))
        })
    })
    if (changeList.length === 0) {
        return
    }
    const changes = { changeList }

    Contacts.update(contact._id, { $push: {
        history: {
            type: 'update',
            createdById: userId,
            createdAt: contact.updatedAt,
            metadata: changes
        }
    }})
}

Contacts.after.insert(addInsertToHistory)
Contacts.after.update(addUpdateToHistory)
*/
