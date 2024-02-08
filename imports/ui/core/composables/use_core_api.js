import { phoneNumberRegex, convertCamelToSnakeCase, convertToDateObject } from '../../../api/core/utilities'

export default function useCoreAPI() {
  return {
    phoneNumberRegex,
    convertCamelToSnakeCase,
    convertToDateObject
  }
}
