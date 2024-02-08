import SimpleSchema from 'simpl-schema'
import { HistoryLogTypesEnum } from './enums'

const historyLogSchema = new SimpleSchema({
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
  jobCardId: {
    type: String,
    optional: true
  },
  createdById: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        return this.userId
      }
      if (this.isUpsert) {
        return { $setOnInsert: this.userId }
      }
      return this.unset()
    }
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return this.isSet ? this.value : new Date()
      }
      if (this.isUpsert) {
        return { $setOnInsert: this.isSet ? this.value : new Date() }
      }
      return this.unset()
    }
  }
})

export default historyLogSchema
