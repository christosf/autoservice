const ContactTypesEnum = {
    INDIVIDUAL: 'individual',
    COMPANY: 'company'
}

const AddressTypesEnum = {
    INVOICE: 'invoice',
    DELIVERY: 'delivery',
    PRIVATE: 'private',
    OTHER: 'other'
  }

Object.freeze(ContactTypesEnum)
Object.freeze(AddressTypesEnum)

export { ContactTypesEnum, AddressTypesEnum }
