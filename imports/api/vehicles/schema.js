import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    code: {
        type: String,
        denyUpdate: true
    },
    ownerId: String,
    make: {
        type: String,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    model: {
        type: String,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    makeModel: {
        type: String,
        max: 100
    },
    regNumber: {
        type: String,
        min: 4,
        max: 10,
        regEx: /^$|^[a-zA-Z0-9]{3,10}$/,
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
    tags: Array,
    'tags.$': String,
    bodyType: {
        type: String,
        max: 50,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    fuelType: {
        type: String,
        max: 50,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    engine: {
        type: String,
        max: 50,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    gearbox: {
        type: String,
        max: 50,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    drivetrain: {
        type: String,
        max: 50,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    modelYear: {
        type: String,
        max: 4,
        regEx: /^[0-9]{4}$/,
        optional: true
    },
    notes: {
        type: String,
        max: 1000,
        optional: true,
    },
    isActive: {
        type: Boolean,
        defaultValue: true
    },
    createdById: {
        type: String,
        denyUpdate: true,
        autoValue() {
            if (this.isInsert) {
                return this.userId
            } else if (this.isUpsert) {
                return { $setOnInsert: this.userId }
            } else {
                this.unset()
            }
        }
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
        autoValue() {
            if (this.isInsert) {
                return new Date()
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() }
            } else {
                this.unset()
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date()
        }
    }
})
