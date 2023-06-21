import { Vehicles } from '../../database'

export default Vehicles.createQuery('getVehicle', {
    $filter({ filters, params }) {
        if (params.code) {
            filters.code = params.code.toUpperCase()
        }
        if (params.id) {
            filters._id = params.id
        }
    },
    code: 1,
    make: 1,
    model: 1,
    makeModel: 1,
    regNumber: 1,
    chassisNumber: 1,
    tags: 1,
    bodyType: 1,
    fuelType: 1,
    engine: 1,
    gearbox: 1,
    drivetrain: 1,
    modelYear: 1,
    notes: 1,
    isActive: 1,
    createdAt: 1,
    updatedAt: 1,
    owner: {
        code: 1,
        name: 1,
        mobilePhone: 1,
        landlinePhone: 1
    },
    createdBy: {
        username: 1
    }
})
