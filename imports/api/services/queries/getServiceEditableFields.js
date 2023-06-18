import { Services } from '../../database'

export default Services.createQuery('getServiceEditableFields', {
    $filter({ filters, params }) {
        filters._id = params.id
    },
    name: 1,
    description: 1,
    ratePerHour: 1,
    hours: 1,
    tags: 1,
    noVat: 1
})
