import SimpleSchema from 'simpl-schema'
import { isURL, isEmail } from 'validator'
import { AddressTypesEnum, ContactTypesEnum } from './enums'

export default new SimpleSchema({
    code: {
        type: String,
        denyUpdate: true
    },
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
    mobilePhone: {
        type: String,
        min: 8,
        max: 20,
        regEx: /^$|^[0-9]{8,20}$/,
        optional() {
            return this.field('type').value === ContactTypesEnum.COMPANY
        }
    },
    landlinePhone: {
        type: String,
        min: 8,
        max: 20,
        regEx: /^$|^[0-9]{8,20}$/,
        optional() {
            return this.field('type').value === ContactTypesEnum.INDIVIDUAL
        }
    },
    addresses: Array,
    'addresses.$': Object,
    'addresses.$.street': {
        type: String,
        min: 3,
        max: 50,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'addresses.$.city': {
        type: String,
        min: 2,
        max: 30,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'addresses.$.postalCode': {
        type: String,
        min: 4,
        max: 10,
        autoValue() {
            return this.isSet ? this.value.toUpperCase() : this.unset()
        }
    },
    'addresses.$.type': {
        type: String,
        allowedValues: Object.values(AddressTypesEnum)
    },
    email: {
        type: String,
        max: 100,
        optional: true,
        custom() {
            if (!this.value || isEmail(this.value)) {
                return undefined
            }
            return 'invalid_email'
        }
    },
    website: {
        type: String,
        max: 100,
        optional: true,
        custom() {
            if (!this.value || isURL(this.value)) {
                return undefined
            }
            return 'invalid_url'
        }
    },
    vatNumber: {
        type: String,
        max: 30,
        optional: true
    },
    notes: {
        type: String,
        max: 1000,
        optional: true,
    },
    balance: {
        type: Number,
        defaultValue: 0
    },
    vehiclesCount: {
        type: Number,
        defaultValue: 0
    },
    active: {
        type: Boolean,
        defaultValue: true
    },
    addedById: {
        type: String,
        denyUpdate: true,
        autoValue() {
            if (this.isInsert) {
                return this.userId
            } else if (this.isUpsert) {
                return { $setOnInsert: this.userId }
            } else {
                this.unset()
            }
        }
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
        autoValue() {
            if (this.isInsert) {
                return new Date()
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() }
            } else {
                this.unset()
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date()
        }
    }
})
