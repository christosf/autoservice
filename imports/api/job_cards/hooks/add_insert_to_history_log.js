import { diff } from 'just-diff'
import { historyLogExcludedFields as excludedFields } from '../utilities'
import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const addInsertToHistoryLog = async function(userId, jobCard) {
  const prev = { tags: [] }
  const rawChanges = diff(prev, jobCard)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change

    const isExcluded = path.some((item) => excludedFields.includes(item))

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
      jobCardId: jobCard._id,
      createdById: jobCard.createdById,
      createdAt: jobCard.updatedAt
    }
  })
}

export default addInsertToHistoryLog
