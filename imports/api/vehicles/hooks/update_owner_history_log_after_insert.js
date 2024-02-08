import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const updateOwnerHistoryLogAfterInsert = async function(userId, vehicle) {
  insertHistoryLog({
    log: {
      type: HistoryLogTypesEnum.LINK,
      metadata: {
        linkType: 'vehicle',
        vehicle: {
          _id: vehicle._id,
          code: vehicle.code
        }
      },
      contactId: vehicle.ownerId,
      createdById: userId,
      createdAt: vehicle.updatedAt
    }
  })
}

export default updateOwnerHistoryLogAfterInsert
