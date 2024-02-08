import SimpleSchema from 'simpl-schema'

const codeSchema = new SimpleSchema({
  code: {
    type: String,
    autoValue() {
      // Only allow this field to be set at insert.
      if (this.isInsert && this.isSet) {
        return this.value
      }
      return this.unset()
    }
  }
})

export default codeSchema
