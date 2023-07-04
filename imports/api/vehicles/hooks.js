import { Vehicles, Contacts } from '../database'

const updateOwnerVehicleCount = (_userId, vehicle) => {
    const vehiclesLink = Contacts.getLink(vehicle.ownerId, 'vehicles')
    const vehicleCount = vehiclesLink.find({ isActive: true }, { fields: { _id: 1 }}).count()

    Contacts.update(vehicle.ownerId, { $set: { vehicleCount }})
}

Vehicles.after.insert(updateOwnerVehicleCount)
Vehicles.after.update(updateOwnerVehicleCount)
Vehicles.after.remove(updateOwnerVehicleCount)
