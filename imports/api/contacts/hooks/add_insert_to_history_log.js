import { diff } from 'just-diff'
import { historyLogExcludedFields as excludedFields } from '../utilities'
import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const addInsertToHistoryLog = async function(userId, contact) {
  const prev = { contactMethods: [], tags: [] }
  const rawChanges = diff(prev, contact)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change

    const isExcluded = path.some((item) => excludedFields.includes(item.toString()) || item === 'isActive')

    if (!isExcluded) {
      changeList.push({ op, path, value })
    }
  })

  if (changeList.length === 0) {
    return
  }

  insertHistoryLog({
    log: {
      type: HistoryLogTypesEnum.INSERT,
      metadata: { changeList },
      contactId: contact._id,
      createdById: contact.createdById,
      createdAt: contact.updatedAt
    }
  })
}

export default addInsertToHistoryLog
