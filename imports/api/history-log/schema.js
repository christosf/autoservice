import SimpleSchema from 'simpl-schema'
import { HistoryLogTypesEnum } from './enums'

export default new SimpleSchema({
    type: {
        type: String,
        allowedValues: Object.values(HistoryLogTypesEnum)
    },
    metadata: {
        type: Object,
        optional: true,
        blackbox: true
    },
    contactId: {
        type: String,
        optional: true
    },
    vehicleId: {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
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
    }
})
