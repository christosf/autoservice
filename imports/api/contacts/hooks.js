import { diff } from 'just-diff'
import objectPath from 'object-path'

import { Contacts } from '../database'
import { insertHistoryLog } from '../history-log/functions'
import { HistoryLogTypesEnum } from '../history-log/enums'

const notAllowedFields = [
    '_id',
    'code',
    'createdById',
    'createdAt',
    'updatedAt',
    'vehicleCount',
    'searchableName',
    'searchableTags',
    'searchableValue'
]

const addInsertToHistory = (_userId, contact) => {
    const prev = { tags: [], contactMethods: [] }
    const rawChanges = diff(prev, contact)
    const changeList = new Array()

    rawChanges.forEach(change => {
        const { op, path, value } = change

        let isAllowed = true
        path.forEach(item => {
            if (notAllowedFields.includes(item) || item === 'isActive') {
                isAllowed = false
            }
        })
        if (isAllowed) {
            changeList.push({ op, path, value })
        }
    })

    if (changeList.length === 0) {
        return
    }
    
    insertHistoryLog({
        type: HistoryLogTypesEnum.INSERT,
        metadata: { changeList },
        contactId: contact._id,
        createdById: contact.createdById,
        createdAt: contact.updatedAt
    })
}

const addUpdateToHistory = function(userId, contact) {
    const prev = this.previous
    const rawChanges = diff(prev, contact)
    const changeList = new Array()

    rawChanges.forEach(change => {
        const { op, path, value } = change
        const oldValue = objectPath.get(prev, path.join('.'))

        let isAllowed = true
        path.forEach(item => {
            if (notAllowedFields.includes(item)) {
                isAllowed = false
            }
        })
        if (isAllowed) {
            changeList.push({ op, path, value, oldValue })
        }
    })

    if (changeList.length === 0) {
        return
    }

    if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && changeList[0].value) {
        insertHistoryLog({
            type: HistoryLogTypesEnum.ACTIVATION,
            contactId: contact._id,
            createdById: userId,
            createdAt: new Date()
        })
    } else if (changeList.length === 1 && changeList[0].path[0] === 'isActive' && !changeList[0].value) {
        insertHistoryLog({
            type: HistoryLogTypesEnum.DEACTIVATION,
            contactId: contact._id,
            createdById: userId,
            createdAt: new Date()
        })
    } else if (changeList.length === 1 && changeList[0].path[0] === 'notes') {
        insertHistoryLog({
            type: HistoryLogTypesEnum.NOTES_UPDATE,
            metadata: { changeList },
            contactId: contact._id,
            createdById: userId,
            createdAt: contact.updatedAt
        })
    } else {
        insertHistoryLog({
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
