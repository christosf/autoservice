import { Vehicles } from '../../database'

export default Vehicles.createQuery('getVehicleEditableFields', {
    $filter({ filters, params }) {
        filters._id = params.id
    },
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
    modelYear: 1,
    owner: {
        code: 1,
        type: 1,
        name: 1,
        mobilePhone: 1,
        landlinePhone: 1
    }
})
