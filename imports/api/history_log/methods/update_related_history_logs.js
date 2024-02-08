import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { HistoryLog } from '../../database'
import { checkLoggedIn } from '../../users/utilities'

const updateRelatedHistoryLogs = createMethod({
  name: 'history_log:update_related_history_logs',

  schema: new SimpleSchema({
    vehicleId: String,
    vehicle: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ vehicleId, vehicle }) {
    const { regNumber, makeModel } = vehicle

    const affectedLogs = await HistoryLog.find({ 'metadata.vehicle._id': vehicleId }, { fields: { _id: 1 } })
      .fetchAsync()

    const ids = []
    affectedLogs.forEach((log) => {
      ids.push(log._id)
    })

    HistoryLog.updateAsync({
      _id: { $in: ids }
    }, {
      $set: {
        'metadata.vehicle.deleted': true,
        'metadata.vehicle.regNumber': regNumber,
        'metadata.vehicle.makeModel': makeModel
      }
    }, {
      multi: true
    })
  }
})

export default updateRelatedHistoryLogs
