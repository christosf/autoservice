import SimpleSchema from 'simpl-schema'
import { ContactTypesEnum, ContactMethodTypesEnum } from './enums'
import { phoneNumberRegex, convertToSearchableString } from '../core/utilities'

const contactSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: Object.values(ContactTypesEnum),
    defaultValue: ContactTypesEnum.INDIVIDUAL
  },
  name: {
    type: String,
    min: 3,
    max: 60
  },
  searchableName: {
    type: String,
    autoValue() {
      const nameField = this.field('name')
      return nameField.isSet ? convertToSearchableString({ value: nameField.value }) : this.unset()
    }
  },
  phoneNumber: {
    type: String,
    min: 8,
    max: 20,
    regEx: phoneNumberRegex
  },
  billingAddress: {
    type: Object,
    optional: true,
    autoValue() {
      if (this.value && typeof this.value === 'object' && Object.keys(this.value).length === 0) {
        this.unset()
      }
    }
  },
  'billingAddress.street': {
    type: String,
    min: 3,
    max: 50,
    optional: true
  },
  'billingAddress.postCode': {
    type: String,
    min: 4,
    max: 10,
    optional() {
      return !this.field('billingAddress.street').isSet
    }
  },
  'billingAddress.city': {
    type: String,
    max: 30,
    optional() {
      return !this.field('billingAddress.postCode').isSet
    }
  },
  'billingAddress.country': {
    type: String,
    min: 2,
    max: 30,
    optional() {
      return !this.field('billingAddress.city').isSet
    }
  },
  deliveryAddress: {
    type: Object,
    optional: true,
    autoValue() {
      if (this.value && typeof this.value === 'object' && Object.keys(this.value).length === 0) {
        this.unset()
      }
    }
  },
  'deliveryAddress.street': {
    type: String,
    min: 3,
    max: 50,
    optional: true
  },
  'deliveryAddress.postCode': {
    type: String,
    min: 4,
    max: 10,
    optional() {
      return !this.field('deliveryAddress.street').isSet
    }
  },
  'deliveryAddress.city': {
    type: String,
    max: 30,
    optional() {
      return !this.field('deliveryAddress.postCode').isSet
    }
  },
  'deliveryAddress.country': {
    type: String,
    min: 2,
    max: 30,
    optional() {
      return !this.field('deliveryAddress.city').isSet
    }
  },
  taxRegNumber: {
    type: String,
    max: 20,
    optional: true
  },
  contactMethods: Array,
  'contactMethods.$': Object,
  'contactMethods.$.type': {
    type: String,
    allowedValues: Object.values(ContactMethodTypesEnum)
  },
  'contactMethods.$.value': {
    type: String,
    max: 60
  },
  'contactMethods.$.searchableValue': {
    type: String,
    autoValue() {
      const valueField = this.siblingField('value')
      return valueField.isSet ? convertToSearchableString({ value: valueField.value }) : this.unset()
    }
  },
  'contactMethods.$.description': {
    type: String,
    max: 80,
    optional: true
  },
  vehicleCount: {
    type: Number,
    defaultValue: 0
  },
  vehiclesCache: {
    type: Array,
    optional: true
  },
  'vehiclesCache.$': {
    type: Object,
    blackbox: true
  },
  notes: {
    type: String,
    optional: true
  }
})

export default contactSchema
