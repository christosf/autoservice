import { countVehicles } from '../methods'
import { updateVehicleCount } from '../../contacts/methods'

const updateOwnerVehicleCount = async function(userId, vehicle) {
  const vehicleCount = await countVehicles({
    ownerId: vehicle.ownerId,
    isActive: true
  })
  await updateVehicleCount({ contactId: vehicle.ownerId, vehicleCount })

  // Return if there is no previous owner to update.
  if (!this.previous) {
    return
  }

  const preOwnerVehicleCount = await countVehicles({
    ownerId: this.previous.ownerId,
    isActive: true
  })
  await updateVehicleCount({ contactId: this.previous.ownerId, vehicleCount: preOwnerVehicleCount })
}

export default updateOwnerVehicleCount
