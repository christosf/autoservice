import { Vehicles } from '../../../database'
import { getDistinctFieldValuesQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'
import { getSearchableFieldName } from '../../utilities'
import { convertToSearchableRegex, convertToSearchableString } from '../../../core/utilities'

getDistinctFieldValuesQuery.expose({
  firewall: [checkLoggedIn]
})

getDistinctFieldValuesQuery.resolve(async function(params) {
  const { field, basedOn } = params

  const query = {}
  const filter = convertToSearchableRegex({ value: params.filter })

  query[getSearchableFieldName({ field })] = { $regex: filter }

  if (field === 'model' && basedOn) {
    query.searchableMake = convertToSearchableString({ value: basedOn })
  }

  const response = await Vehicles.rawCollection().distinct(field, query)

  return response.filter((value) => new RegExp(filter).test(convertToSearchableString({ value })))
})
