import { Vehicles } from '../../../database'
import { fieldValueExistsQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'
import { getSearchableFieldName } from '../../utilities'
import { convertToSearchableString } from '../../../core/utilities'

fieldValueExistsQuery.expose({
  firewall: [checkLoggedIn]
})

fieldValueExistsQuery.resolve(async function(params) {
  const { field, value, excludeId } = params

  const query = excludeId ? { _id: { $ne: excludeId } } : {}

  query[getSearchableFieldName({ field })] = convertToSearchableString({ value })

  return new Array(!!await Vehicles.findOneAsync(query, { fields: { _id: 1 } }))
})
