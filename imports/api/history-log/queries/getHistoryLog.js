import { HistoryLog } from '../../database'

export default HistoryLog.createQuery('getHistoryLog', {
    $filter({ filters, options, params }) {
        options.sort = {}

        if (params.type === 'contacts') {
            filters.contactId = params.id
        }

        options.sort[params.sortBy] = params.descending ? 1 : -1
    },
    $paginate: 1,
    type: 1,
    metadata: 1,
    createdAt: 1,
    createdBy: {
        username: 1
    }
})
