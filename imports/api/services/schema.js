import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    code: {
        type: String,
        denyUpdate: true
    },
    name: {
        type: String,
        min: 3,
        max: 60,
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
    hours: {
        type: Number,
        defaultValue: 0
    },
    ratePerHour: {
        type: Number,
        defaultValue: 0
    },
    tags: Array,
    'tags.$': {
        type: String,
        max: 40
    },
    noVat: {
        type: Boolean,
        defaultValue: false
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
