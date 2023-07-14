import SimpleSchema from 'simpl-schema'
import { convertToSearchableString } from '../core/functions'

export default new SimpleSchema({
    ownerId: String,
    make: {
        type: String,
        max: 50
    },
    searchableMake: {
        type: String,
        autoValue() {
            const makeField = this.field('make')
            return makeField.isSet
                ? convertToSearchableString(makeField.value)
                : this.unset()
        }
    },
    model: {
        type: String,
        max: 50
    },
    searchableModel: {
        type: String,
        autoValue() {
            const modelField = this.field('model')
            return modelField.isSet
                ? convertToSearchableString(modelField.value)
                : this.unset()
        }
    },
    makeModel: {
        type: String,
        max: 100
    },
    searchableMakeModel: {
        type: String,
        autoValue() {
            const makeModelField = this.field('makeModel')
            return makeModelField.isSet
                ? convertToSearchableString(makeModelField.value)
                : this.unset()
        }
    },
    regNumber: {
        type: String,
        min: 4,
        max: 10,
        regEx: /^$|^[a-zA-Z0-9]{4,10}$/,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        },
        optional() {
            return this.field('chassisNumber').isSet
        }
    },
    chassisNumber: {
        type: String,
        min: 17,
        max: 17,
        regEx: /^$|^[a-zA-Z0-9]{17}$/,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        },
        optional() {
            return this.field('regNumber').isSet
        }
    },
    bodyType: {
        type: String,
        max: 50,
        optional: true
    },
    searchableBodyType: {
        type: String,
        optional: true,
        autoValue() {
            const bodyTypeField = this.field('bodyType')
            return bodyTypeField.isSet
                ? convertToSearchableString(bodyTypeField.value)
                : this.unset()
        }
    },
    fuelType: {
        type: String,
        max: 50,
        optional: true
    },
    searchableFuelType: {
        type: String,
        optional: true,
        autoValue() {
            const fuelTypeField = this.field('fuelType')
            return fuelTypeField.isSet
                ? convertToSearchableString(fuelTypeField.value)
                : this.unset()
        }
    },
    engine: {
        type: String,
        max: 50,
        optional: true
    },
    searchableEngine: {
        type: String,
        optional: true,
        autoValue() {
            const engineField = this.field('engine')
            return engineField.isSet
                ? convertToSearchableString(engineField.value)
                : this.unset()
        }
    },
    gearbox: {
        type: String,
        max: 50,
        optional: true
    },
    searchableGearbox: {
        type: String,
        optional: true,
        autoValue() {
            const gearboxField = this.field('gearbox')
            return gearboxField.isSet
                ? convertToSearchableString(gearboxField.value)
                : this.unset()
        }
    },
    drivetrain: {
        type: String,
        max: 50,
        optional: true
    },
    searchableDrivetrain: {
        type: String,
        optional: true,
        autoValue() {
            const drivetrainField = this.field('drivetrain')
            return drivetrainField.isSet
                ? convertToSearchableString(drivetrainField.value)
                : this.unset()
        }
    },
    modelYear: {
        type: String,
        min: 4,
        max: 4,
        regEx: /^[0-9]{4}$/,
        optional: true
    },
    notes: {
        type: String,
        optional: true
    }
})
