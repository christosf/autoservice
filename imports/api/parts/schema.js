import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    code: {
        type: String,
        denyUpdate: true
    },
    name: {
        type: String,
        min: 3,
        max: 80,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    description: {
        type: String,
        max: 300,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    unitOfMeasure: {
        type: String,
        max: 20
    },
    /*
    purchaseCost: {
        type: Number,
        optional: true
    },
    salePrice: {
        type: Number,
        optional: true
    },
    supplierId: {
        type: String,
        optional: true
    },
    suitableVehicles: Array,
    'suitableVehicles.$': Object,
    'suitableVehicles.$.make': {
        type: String,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'suitableVehicles.$.model': {
        type: String,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },*/
    // TODO: Will probably need to add more fields for suitable vehicles. (body type, fuel type, engine, gearbox, drivetrain)
    tags: Array,
    'tags.$': {
        type: String,
        max: 40
    },
    active: {
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
