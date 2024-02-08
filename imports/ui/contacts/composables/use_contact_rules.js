import { useContactAPI } from './index'

export default function useContactRules() {
  const { contactExists: contactExistsFn } = useContactAPI()

  const contactExists = async({ name, phoneNumber, excludeId, msg }) => (
    await contactExistsFn({
      name,
      phoneNumber,
      excludeId: excludeId || ''
    }) ? msg : true
  )

  return { contactExists }
}
