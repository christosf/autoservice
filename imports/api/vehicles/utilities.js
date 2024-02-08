const regNumberRegex = /^$|^[a-zA-Z0-9]{4,10}$/
const chassisNumberRegex = /^$|^[a-zA-Z0-9]{17}$/
const modelYearRegex = /^[0-9]{4}$/

const historyLogExcludedFields = [
  '_id',
  'code',
  'createdById',
  'createdAt',
  'updatedAt',
  'makeModel',
  'ownerCache',
  'searchableMake',
  'searchableModel',
  'searchableMakeModel',
  'searchableTags',
  'searchableBodyType',
  'searchableFuelType',
  'searchableEngine',
  'searchableGearbox',
  'searchableDrivetrain'
]

const getSearchableFieldName = ({ field }) => {
  if (['regNumber', 'chassisNumber', 'modelYear'].includes(field)) {
    return field
  }
  return `searchable${field.charAt(0).toUpperCase()}${field.slice(1)}`
}

export {
  regNumberRegex,
  chassisNumberRegex,
  modelYearRegex,
  historyLogExcludedFields,
  getSearchableFieldName
}
