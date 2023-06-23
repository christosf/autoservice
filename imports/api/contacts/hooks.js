import objectPath from 'object-path'
import { diff } from 'just-diff'
import { Contacts } from '../database'

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
