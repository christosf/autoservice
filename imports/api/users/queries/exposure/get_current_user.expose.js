import { getCurrentUserQuery } from '../index'

getCurrentUserQuery.expose({
  firewall(userId, params) {
    params.userId = userId
  },
  embody: {
    $filter({ filters, params }) {
      filters.userId = params.userId
    }
  }
})
