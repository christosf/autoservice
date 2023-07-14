import { diff } from 'just-diff'
import { Vehicles } from '../database'

const vehicleHasUpdates = (_id, updates) => {
    const vehicle = Vehicles.findOne(_id, {
        fields: {
            ownerId: 1,
            make: 1,
            model: 1,
            regNumber: 1,
            chassisNumber: 1,
            tags: 1,
            bodyType: 1,
            fuelType: 1,
            engine: 1,
            gearbox: 1,
            drivetrain: 1,
            modelYear: 1
        }
    })
    delete vehicle._id
    if (!vehicle.regNumber) vehicle.regNumber = ''
    if (!vehicle.chassisNumber) vehicle.chassisNumber = ''
    if (!vehicle.bodyType) vehicle.bodyType = ''
    if (!vehicle.fuelType) vehicle.fuelType = ''
    if (!vehicle.engine) vehicle.engine = ''
    if (!vehicle.gearbox) vehicle.gearbox = ''
    if (!vehicle.drivetrain) vehicle.drivetrain = ''
    if (!vehicle.modelYear) vehicle.modelYear = ''

    return diff(vehicle, updates).length > 0
}

export { vehicleHasUpdates }