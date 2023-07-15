import SimpleSchema from 'simpl-schema'

export default new SimpleSchema({
    contactTags: Array,
    'contactTags.$': Object,
    'contactTags.$.value': String,
    'contactTags.$.color': {
        type: String,
        defaultValue: '#e0e0e0'
    },
    'contactTags.$.isActive': {
        type: Boolean,
        defaultValue: true
    }
})
