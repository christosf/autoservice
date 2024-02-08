import SimpleSchema from 'simpl-schema'

const timestampSchema = new SimpleSchema({
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
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date()
      }
      if (this.isUpsert) {
        return { $setOnInsert: new Date() }
      }
      if (this.isSet) {
        return this.value
      }
      return this.unset()
    }
  }
})

export default timestampSchema
