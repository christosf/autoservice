const historyLogExcludedFields = [

]

const getSearchableFieldName = ({ field }) => (
  `searchable${field.charAt(0).toUpperCase()}${field.slice(1)}`
)

export {
  historyLogExcludedFields,
  getSearchableFieldName
}
