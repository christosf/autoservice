import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    tags: Array,
    'tags.$': {
        type: String,
        max: 40
    }
})
