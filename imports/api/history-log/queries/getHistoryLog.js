import { HistoryLog } from '../../database'

export default HistoryLog.createQuery('getHistoryLog', {
    $filter({ filters, options, params }) {
        options.sort = {}

        switch(params.type) {
            case 'contacts': filters.contactId = params.id; break
            case 'vehicles': filters.vehicleId = params.id; break
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
