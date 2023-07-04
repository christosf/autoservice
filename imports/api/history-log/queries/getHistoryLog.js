import { HistoryLog } from '../../database'

export default HistoryLog.createQuery('getHistoryLog', {
    $filter({ filters, options, params }) {
        if (params.contactId) {
            filters.contactId = params.contactId
        }
        options.sort = { createdAt: -1 }
    },
    type: 1,
    metadata: 1,
    createdAt: 1,
    createdBy: {
        username: 1
    }
})
