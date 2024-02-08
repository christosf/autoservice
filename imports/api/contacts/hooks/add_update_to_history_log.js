import objectPath from 'object-path'
import { diff } from 'just-diff'
import { historyLogExcludedFields as excludedFields } from '../utilities'
import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const addUpdateToHistoryLog = async function(userId, contact) {
  const prev = this.previous
  const rawChanges = diff(prev, contact)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change
    const oldValue = objectPath.get(prev, path.join('.'))

    const isExcluded = path.some((item) => excludedFields.includes(item.toString()))

    if (!isExcluded) {
      changeList.push({ op, path, value, oldValue })
    }
  })

  if (changeList.length === 0) {
    return
  }

  if (changeList.length === 1) {
    if (changeList[0].path[0] === 'isActive') {
      if (!changeList[0].value) {
        insertHistoryLog({
          log: {
            type: HistoryLogTypesEnum.DEACTIVATION,
            contactId: contact._id,
            createdById: userId,
            createdAt: new Date()
          }
        })
        return
      }

      insertHistoryLog({
        log: {
          type: HistoryLogTypesEnum.ACTIVATION,
          contactId: contact._id,
          createdById: userId,
          createdAt: new Date()
        }
      })
      return
    }

    if (changeList[0].path[0] === 'notes') {
      insertHistoryLog({
        log: {
          type: HistoryLogTypesEnum.NOTES_UPDATE,
          metadata: { changeList },
          contactId: contact._id,
          createdById: userId,
          createdAt: contact.updatedAt
        }
      })
      return
    }
  }

  insertHistoryLog({
    log: {
      type: HistoryLogTypesEnum.UPDATE,
      metadata: { changeList },
      contactId: contact._id,
      createdById: userId,
      createdAt: contact.updatedAt
    }
  })
}

export default addUpdateToHistoryLog
