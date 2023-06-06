import { Meteor } from 'meteor/meteor'
import { Vehicles, Contacts } from '../database'

const updateOwnerVehicleCount = (_userId, vehicle) => {
    if (Meteor.isClient) return

    const vehiclesLink = Contacts.getLink(vehicle.ownerId, 'vehicles')
    const vehiclesCount = vehiclesLink.find({ active: true }, { fields: { _id: 1 }}).count()

    Contacts.update(vehicle.ownerId, { $set: { vehiclesCount }})
}

Vehicles.after.insert(updateOwnerVehicleCount)
Vehicles.after.update(updateOwnerVehicleCount)
Vehicles.after.remove(updateOwnerVehicleCount)
