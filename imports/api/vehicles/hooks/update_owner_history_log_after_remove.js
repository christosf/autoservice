import { insertHistoryLog, updateRelatedHistoryLogs } from '../../history_log/methods'
import { HistoryLogTypesEnum } from '../../history_log/enums'

const updateOwnerHistoryLogAfterRemove = async function(userId, vehicle) {
  await insertHistoryLog({
    log: {
      type: HistoryLogTypesEnum.UNLINK_DELETE,
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

  // Update all history logs' metadata of this vehicle with the latest data before deletion.
  updateRelatedHistoryLogs({ vehicleId: vehicle._id, vehicle })
}

export default updateOwnerHistoryLogAfterRemove
