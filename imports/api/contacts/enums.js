const ContactTypesEnum = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company'
}

const ContactMethodTypesEnum = {
  PHONE: 'phone',
  EMAIL: 'email',
  FAX: 'fax',
  WEBSITE: 'website'
}

Object.freeze(ContactTypesEnum)
Object.freeze(ContactMethodTypesEnum)

export { ContactTypesEnum, ContactMethodTypesEnum }
