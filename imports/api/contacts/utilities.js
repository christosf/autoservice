const historyLogExcludedFields = [
  '_id',
  'code',
  'createdById',
  'createdAt',
  'updatedAt',
  'vehicleCount',
  'vehiclesCache',
  'searchableName',
  'searchableTags',
  'searchableValue'
]

const getSearchableFieldName = ({ field }) => {
  if (field === 'contactMethods.value') {
    return 'contactMethods.searchableValue'
  }
  return `searchable${field.charAt(0).toUpperCase()}${field.slice(1)}`
}

export {
  historyLogExcludedFields,
  getSearchableFieldName
}
