import { JobCards } from '../../../database'
import { getDistinctFieldValuesQuery } from '../index'
import { checkLoggedIn } from '../../../users/utilities'
import { getSearchableFieldName } from '../../utilities'
import { convertToSearchableRegex, convertToSearchableString } from '../../../core/utilities'

getDistinctFieldValuesQuery.expose({
  firewall: [checkLoggedIn]
})

getDistinctFieldValuesQuery.resolve(async function(params) {
  const { field } = params

  const query = {}
  const filter = convertToSearchableRegex({ value: params.filter })

  query[getSearchableFieldName({ field })] = { $regex: filter }

  const response = await JobCards.rawCollection().distinct(field, query)

  return response.filter((item) => new RegExp(filter).test(convertToSearchableString({ value: item })))
})
