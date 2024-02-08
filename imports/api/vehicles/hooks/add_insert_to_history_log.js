import { diff } from 'just-diff'
import { historyLogExcludedFields as excludedFields } from '../utilities'
import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const addInsertToHistoryLog = async function(userId, vehicle) {
  const prev = { tags: [] }
  const rawChanges = diff(prev, vehicle)
  const changeList = []

  rawChanges.forEach((change) => {
    const { op, path, value } = change

    const isExcluded = path.some((item) => excludedFields.includes(item) || item === 'isActive')

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
      vehicleId: vehicle._id,
      createdById: vehicle.createdById,
      createdAt: vehicle.updatedAt
    }
  })
}

export default addInsertToHistoryLog
