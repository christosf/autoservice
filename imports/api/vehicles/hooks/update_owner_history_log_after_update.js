import { insertHistoryLog } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const updateOwnerHistoryLogAfterUpdate = async function(userId, vehicle) {
  if (vehicle.ownerId === this.previous.ownerId) {
    return
  }

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
      createdAt: new Date()
    }
  })

  insertHistoryLog({
    log: {
      type: HistoryLogTypesEnum.UNLINK,
      metadata: {
        linkType: 'vehicle',
        vehicle: {
          _id: vehicle._id,
          code: vehicle.code
        }
      },
      contactId: this.previous.ownerId,
      createdById: userId,
      createdAt: new Date()
    }
  })
}

export default updateOwnerHistoryLogAfterUpdate
