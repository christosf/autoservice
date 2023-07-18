const ContactTypesEnum = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company'
}

const ContactMethodsEnum = {
  PHONE: 'phone',
  EMAIL: 'email',
  FAX: 'fax',
  WEBSITE: 'website'
}

Object.freeze(ContactTypesEnum)
Object.freeze(ContactMethodsEnum)

export { ContactTypesEnum, ContactMethodsEnum }
