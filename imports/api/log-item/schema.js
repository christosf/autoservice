import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    history: {
        type: Array,
        defaultValue: []
    },
    'history.$': Object,
    'history.$.type': {
        type: String,
        allowedValues: ['insert', 'update', 'deactivation', 'activation']
    },
    'history.$.createdById': String,
    'history.$.createdAt': Date,
    'history.$.metadata': {
        type: Object,
        optional: true,
        blackbox: true
    }
})
