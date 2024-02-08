import SimpleSchema from 'simpl-schema'

const isActiveSchema = new SimpleSchema({
  isActive: {
    type: Boolean,
    defaultValue: true
  }
})

export default isActiveSchema
