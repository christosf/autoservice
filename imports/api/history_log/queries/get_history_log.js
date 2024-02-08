import SimpleSchema from 'simpl-schema'
import { HistoryLog } from '../../database'

const schema = new SimpleSchema({
  objectId: String,
  objectType: String,
  sortBy: String,
  descending: Boolean,
  limit: Number,
  skip: Number
})

const getHistoryLogQuery = HistoryLog.createQuery('history_log:get_history_log', {
  $filter({ filters, options, params }) {
    options.sort = {}

    switch (params.objectType) {
      case 'contacts': filters.contactId = params.objectId; break
      case 'vehicles': filters.vehicleId = params.objectId; break
      case 'jobCards': filters.jobCardId = params.objectId; break
      default: break
    }

    options.sort[params.sortBy] = params.descending ? 1 : -1
  },
  $paginate: 1,
  type: 1,
  metadata: 1,
  createdAt: 1,
  createdBy: {
    username: 1
  },
  contactId: 1,
  vehicleId: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getHistoryLogQuery
