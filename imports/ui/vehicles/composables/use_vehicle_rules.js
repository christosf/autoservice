import { useVehicleAPI } from './index'

export default function useVehicleRules() {
  const { regNumberRegex, chassisNumberRegex, fieldValueExists: fieldValueExistsFn } = useVehicleAPI()

  const regNumber = ({ value, msg }) => regNumberRegex.test(value) || msg
  const chassisNumber = ({ value, msg }) => chassisNumberRegex.test(value) || msg

  const fieldValueExists = async({ value, field, excludeId, msg }) => (
    await fieldValueExistsFn({
      field,
      value,
      excludeId: excludeId || ''
    }) ? msg : true
  )

  return {
    regNumber,
    chassisNumber,
    fieldValueExists
  }
}
