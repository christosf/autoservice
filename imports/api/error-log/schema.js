import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    code: {
        type: String,
        denyUpdate: true
    },
    location: String,
    path: String,
    object: {
        type: Object,
        blackbox: true
    },
    isArchived: {
        type: Boolean,
        defaultValue: false
    },
    createdById: {
        type: String,
        denyUpdate: true,
        autoValue() {
            if (this.isInsert) {
                return this.userId
            } else if (this.isUpsert) {
                return { $setOnInsert: this.userId }
            }
            this.unset()
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
            }
            this.unset()
        }
    }
})
