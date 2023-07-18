import { Contacts } from '../../database'

export default Contacts.createQuery('getContactPositions', {
  $filter({ filters, options, params }) {
    filters.updatedAt = { $lt: params.updatedAt }
    options.sort = { updatedAt: 1 }
  },
  code: 1,
  updatedAt: 1
})
