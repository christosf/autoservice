import { isURL, isEmail } from 'validator'
import { useCoreAPI } from './index'

export default function useCoreRules() {
  const { phoneNumberRegex } = useCoreAPI()

  const url = ({ value, msg }) => isURL(value) || msg
  const email = ({ value, msg }) => isEmail(value) || msg
  const required = ({ value, msg }) => !!value || msg
  const minLength = ({ value, length, msg }) => (!value || value.length >= length) || msg
  const phoneNumber = ({ value, msg }) => phoneNumberRegex.test(value) || msg
  const optionalIfEmpty = ({ value, field, msg }) => (!!value || !field) || msg

  return {
    url,
    email,
    required,
    minLength,
    phoneNumber,
    optionalIfEmpty
  }
}
