const phoneNumberRegex = /^[0-9]{8,20}$/

const convertToSearchableString = ({ value }) => (
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
)

const convertToSearchableRegex = ({ value }) => (
  convertToSearchableString({ value }).replace(/([()[{*+.$^\\|?])/g, '\\$1')
)

const convertToSlug = async({ value }) => {
  const slug = await import('slug')

  return slug(value)
}

const convertToDateObject = ({ value }) => {
  if (value && value.length === 16) {
    return new Date(
      parseInt(value.substring(6, 10), 10),
      parseInt(value.substring(3, 5) - 1, 10),
      parseInt(value.substring(0, 2), 10),
      parseInt(value.substring(11, 13), 10),
      parseInt(value.substring(14, 16), 10)
    )
  }

  if (value && value.length === 10) {
    return new Date(
      parseInt(value.substring(6, 10), 10),
      parseInt(value.substring(3, 5) - 1, 10),
      parseInt(value.substring(0, 2), 10)
    )
  }

  return undefined
}

const convertCamelToSnakeCase = ({ value }) => value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export {
  phoneNumberRegex,
  convertToSearchableString,
  convertToSearchableRegex,
  convertToSlug,
  convertToDateObject,
  convertCamelToSnakeCase
}
