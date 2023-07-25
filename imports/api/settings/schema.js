import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
  companyName: {
    type: String,
    optional: true
  },
  companyNameShort: {
    type: String,
    optional: true
  }
})
