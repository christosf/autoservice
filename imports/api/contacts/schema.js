import SimpleSchema from 'simpl-schema'
import { ContactTypesEnum } from './enums'
import { convertToSearchableString } from '../core/functions'

export default new SimpleSchema({
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
      return nameField.isSet
        ? convertToSearchableString(nameField.value)
        : this.unset()
    }
  },
  phoneNumber: {
    type: String,
    min: 8,
    max: 20,
    regEx: /^[0-9]{8,20}$/
  },
  billingAddress: {
    type: Object,
    optional: true
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
    min: 2,
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
    optional: true
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
    min: 2,
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
    allowedValues: ['email', 'phone', 'fax', 'website']
  },
  'contactMethods.$.value': {
    type: String,
    max: 100
  },
  'contactMethods.$.searchableValue': {
    type: String,
    autoValue() {
      const valueField = this.siblingField('value')
      return valueField.isSet
        ? convertToSearchableString(valueField.value)
        : this.unset()
    }
  },
  'contactMethods.$.description': {
    type: String,
    max: 80,
    optional: true
  },
  notes: {
    type: String,
    optional: true
  },
  vehicleCount: {
    type: Number,
    defaultValue: 0
  }
})
