import SimpleSchema from 'simpl-schema'
import { ContactTypesEnum } from './enums'

export default new SimpleSchema({
    type: {
        type: String,
        allowedValues: Object.values(ContactTypesEnum),
        defaultValue: ContactTypesEnum.INDIVIDUAL
    },
    name: {
        type: String,
        min: 3,
        max: 60,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    phoneNumber: {
        type: String,
        min: 8,
        max: 20,
        regEx: /^$|^[0-9]{8,20}$/,
    },
    billingAddress: {
        type: Object,
        optional: true
    },
    'billingAddress.street': {
        type: String,
        min: 3,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'billingAddress.postCode': {
        type: String,
        min: 4,
        max: 10,
        optional() {
            return !this.field('billingAddress.street').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'billingAddress.city': {
        type: String,
        min: 2,
        max: 30,
        optional() {
            return !this.field('billingAddress.postCode').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'billingAddress.country': {
        type: String,
        min: 2,
        max: 30,
        optional() {
            return !this.field('billingAddress.city').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        },
    },
    deliveryAddress: {
        type: Object,
        optional: true
    },
    'deliveryAddress.street': {
        type: String,
        min: 3,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'deliveryAddress.postCode': {
        type: String,
        min: 4,
        max: 10,
        optional() {
            return !this.field('deliveryAddress.street').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'deliveryAddress.city': {
        type: String,
        min: 2,
        max: 30,
        optional() {
            return !this.field('deliveryAddress.postCode').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'deliveryAddress.country': {
        type: String,
        min: 2,
        max: 30,
        optional() {
            return !this.field('deliveryAddress.city').isSet
        },
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    taxRegNumber: {
        type: String,
        max: 20,
        optional: true
    },
    notes: {
        type: String,
        max: 2000,
        optional: true,
    },
    vehiclesCount: {
        type: Number,
        defaultValue: 0
    },
    contactMethods: Array,
    'contactMethods.$': Object,
    'contactMethods.$.type': {
        type: String,
        allowedValues: ['email', 'phone', 'fax', 'website']
    },
    'contactMethods.$.value': {
        type: String,
        max: 100
    },
    'contactMethods.$.description': {
        type: String,
        max: 60,
        optional: true,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    }
})
