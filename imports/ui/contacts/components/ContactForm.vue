<script setup>
import { ref, reactive, computed, nextTick, toRaw, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useContactStore } from '../store'
import { useContactAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'

import FieldContactType from './fields/FieldContactType.vue'
import FieldName from './fields/FieldName.vue'
import FieldPhoneNumber from './fields/FieldPhoneNumber.vue'
import FieldTags from './fields/FieldTags.vue'
import FieldAddressStreet from './fields/FieldAddressStreet.vue'
import FieldAddressPostCode from './fields/FieldAddressPostCode.vue'
import FieldAddressCity from './fields/FieldAddressCity.vue'
import FieldAddressCountry from './fields/FieldAddressCountry.vue'
import FieldTaxRegNumber from './fields/FieldTaxRegNumber.vue'
import FieldContactMethods from './fields/FieldContactMethods.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator(value) {
      return ['insert', 'update'].includes(value.toString())
    }
  },
  isDialog: Boolean
})
const emit = defineEmits(['hide'])

const $q = useQuasar()
const { t: $t } = useI18n()
const contactStore = useContactStore()
const { notifyError, notifySuccess, consoleLog } = useCoreFunctions()

const {
  getContactEditableFieldsQuery,
  ContactTypesEnum,
  insertContact,
  updateContact
} = useContactAPI()

const stepperRef = ref(null)
const basicDetailsFormRef = ref(null)
const addressesFormRef = ref(null)
const extraDetailsFormRef = ref(null)
const nameFieldRef = ref(null)
const phoneNumberFieldRef = ref(null)
const deliveryAddressFieldRef = ref(null)

const getContactEditableFields = getContactEditableFieldsQuery.clone()
const title = ref(props.type === 'insert' ? $t('contacts.new') : $t('contacts.edit'))
const isLoading = ref(true)
const isFormSubmitted = ref(false)
const origin = ref(null)
const contactId = ref('')
const contactCode = ref('')
const insertedContact = ref(null)
const differentDeliveryAddress = ref(false)

const steps = reactive({
  current: 'basicDetails',
  basicDetails: { hasError: false },
  addresses: { hasError: false },
  extraDetails: { hasError: false }
})

const form = reactive({
  type: ContactTypesEnum.INDIVIDUAL,
  name: '',
  phoneNumber: '',
  billingAddress: {
    street: '',
    postCode: '',
    city: '',
    country: ''
  },
  deliveryAddress: {
    street: '',
    postCode: '',
    city: '',
    country: ''
  },
  taxRegNumber: '',
  contactMethods: [],
  tags: []
})

const submitBtnLabel = computed(() => (props.type === 'update' ? $t('core.save') : $t('core.add')))
const submitBtnIcon = computed(() => (props.type === 'update' ? 'sym_o_save' : 'sym_o_person_add'))

const isFormVisible = computed(() => (
  !isLoading.value && ((props.type === 'insert' && !insertedContact.value) || (props.type === 'update'))
))

const focusDeliveryAddressField = () => {
  if ($q.platform.is.desktop) {
    nextTick(() => {
      deliveryAddressFieldRef.value.focus()
    })
  }
}

const focusPhoneNumberField = () => {
  steps.current = 'basicDetails'
  nextTick(() => {
    phoneNumberFieldRef.value.focus()
  })
}

const validationError = (step, formRef) => {
  steps.current = step
  steps[step].hasError = true

  nextTick(() => {
    const components = formRef.getValidationComponents()
    const component = components.find((c) => !!c.hasError)
    component.focus()
  })
}

const resetFormValidation = (step) => {
  if (step === 'basicDetails' && basicDetailsFormRef.value) {
    basicDetailsFormRef.value.resetValidation()
  }
  if (step === 'addresses' && addressesFormRef.value) {
    addressesFormRef.value.resetValidation()
  }
  if (step === 'extraDetails' && extraDetailsFormRef.value) {
    extraDetailsFormRef.value.resetValidation()
  }

  steps[step].hasError = false
}

const contactTypeFieldUpdated = () => {
  resetFormValidation('basicDetails')

  if ($q.platform.is.desktop && nameFieldRef.value) {
    nameFieldRef.value.focus()
  }
}

const resetForm = () => {
  isFormSubmitted.value = false
  differentDeliveryAddress.value = false
  insertedContact.value = null

  form.type = ContactTypesEnum.INDIVIDUAL
  form.name = ''
  form.phoneNumber = ''
  form.billingAddress = {
    street: '',
    postCode: '',
    city: '',
    country: ''
  }
  form.deliveryAddress = {
    street: '',
    postCode: '',
    city: '',
    country: ''
  }
  form.taxRegNumber = ''
  form.contactMethods.splice(0)
  form.tags.splice(0)

  steps.current = 'basicDetails'
  steps.basicDetails.hasError = false
  steps.addresses.hasError = false
  steps.extraDetails.hasError = false
}

const submitForm = async() => {
  isFormSubmitted.value = true

  let basicDetailsFormVal = true
  let addressesFormVal = true
  let extraDetailsFormVal = true

  if (basicDetailsFormRef.value) {
    basicDetailsFormVal = await basicDetailsFormRef.value.validate()
  }
  if (addressesFormRef.value) {
    addressesFormVal = await addressesFormRef.value.validate()
  }
  if (extraDetailsFormRef.value) {
    extraDetailsFormVal = await extraDetailsFormRef.value.validate()
  }

  if (basicDetailsFormVal && addressesFormVal && extraDetailsFormVal) {
    const contact = structuredClone(toRaw(form))

    // Remove delivery address if the option is not selected.
    if (!differentDeliveryAddress.value && Object.keys(contact.deliveryAddress).length > 0) {
      delete contact.deliveryAddress
    }

    if (props.type === 'insert') {
      try {
        // @ts-ignore
        const { _id, code } = await insertContact({ contact })

        insertedContact.value = { _id, code }

        if (origin.value === 'insertVehicleDialog') {
          contactStore.setProvidedContact({
            contact: {
              _id,
              code,
              name: contact.name,
              phoneNumber: contact.phoneNumber
            }
          })
        }
      } catch (error) {
        consoleLog(error)
        notifyError()
      }
    } else if (props.type === 'update') {
      try {
        // @ts-ignore
        const { updated } = await updateContact({ contactId: contactId.value, contact })

        if (updated) {
          notifySuccess($t('contacts.msg_update_successful'))
          emit('hide')
        } else {
          notifyError()
        }
      } catch (error) {
        if (error.error === 'no-updated-fields') {
          emit('hide')
        } else {
          consoleLog(error)
          notifyError()
        }
      }
    }
  }

  isFormSubmitted.value = false
}

const fetchContact = async() => {
  getContactEditableFields.setParams({ contactId: contactId.value })

  try {
    const contact = await getContactEditableFields.fetchOneSync()

    Object.keys(contact).forEach((field) => {
      if (field in form) {
        if (typeof form[field] === 'object') {
          if (Array.isArray(contact[field])) {
            contact[field].forEach((item) => {
              form[field].push(item)
            })
            return
          }

          const objectKeys = Object.keys(contact[field])
          if (objectKeys.length > 0) {
            objectKeys.forEach((property) => {
              form[field][property] = contact[field][property]
            })
            return
          }
        }

        form[field] = contact[field]
      }
    })

    if (contact.deliveryAddress && Object.keys(contact.deliveryAddress).length > 0) {
      differentDeliveryAddress.value = true
    }

    title.value = `${$t('core.edit')}: ${contactCode.value} - ${contact.name}`
  } catch (error) {
    notifyError()
    emit('hide')
  }
}

const setFormParams = async(params) => {
  isLoading.value = true

  if (params) {
    if (props.type === 'insert') {
      if (params.origin) {
        origin.value = params.origin
      }
    }

    if (props.type === 'update' && params.contactId && params.contactCode) {
      contactId.value = params.contactId
      contactCode.value = params.contactCode
      await fetchContact()
    }
  }

  isLoading.value = false
}

onBeforeMount(() => {
  if (props.type === 'insert') {
    isLoading.value = false
  }
})

defineExpose({
  setFormParams
})
</script>

<template>
  <q-card :flat='!props.isDialog' :bordered='!props.isDialog'>
    <q-card-section class='q-pa-xs border-bottom'>
      <q-toolbar>
        <div class='text-h4 text-bold'>{{ title }}</div>
        <q-space />
        <q-btn v-if='props.isDialog' icon='sym_o_close' flat round dense v-close-popup />
      </q-toolbar>
    </q-card-section>
    <q-card-section class='q-pa-none'>
      <transition name='fade' mode='out-in'>
        <q-stepper
          v-if='isFormVisible'
          v-model='steps.current'
          :contracted='$q.screen.lt.sm'
          ref='stepperRef'
          color='primary'
          keep-alive
          swipeable
          header-nav
          animated
          flat
        >
          <q-step
            name='basicDetails'
            :title='$t("core.basic_details")'
            :error='steps.basicDetails.hasError'
            icon='sym_o_person'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("basicDetails", basicDetailsFormRef)'
              ref='basicDetailsFormRef'
              class='q-gutter-md'
            >
              <field-contact-type
                v-model='form.type'
                @update:model-value='contactTypeFieldUpdated'
              />
              <field-name
                v-model='form.name'
                @update:model-value='resetFormValidation("basicDetails")'
                :field-type='form.type'
                :field-phone-number='form.phoneNumber'
                :exclude-id='contactId'
                :autofocus='$q.platform.is.desktop'
                ref='nameFieldRef'
              />
              <field-phone-number
                v-model='form.phoneNumber'
                @update:model-value='resetFormValidation("basicDetails")'
                ref='phoneNumberFieldRef'
              />
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='submitForm'
                  :label='submitBtnLabel'
                  :icon='submitBtnIcon'
                  :loading='isFormSubmitted'
                  color='primary'
                  no-caps
                />
                <q-btn
                  @click='steps.current = "addresses"'
                  :label='$q.screen.gt.xs ? $t("core.addresses") : null'
                  icon='sym_o_chevron_right'
                  color='secondary'
                  outline
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
          <q-step
            name='addresses'
            :title='$t("core.addresses")'
            :error='steps.addresses.hasError'
            icon='sym_o_person_pin_circle'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("addresses", addressesFormRef)'
              ref='addressesFormRef'
              class='q-gutter-md'
            >
              <div class='q-mt-none'>
                <div class='text-h5 text-bold q-mb-md'>{{ $t('core.address_billing') }}</div>
                <div class='row q-col-gutter-sm'>
                  <div class='col-xs-9 col-sm-12'>
                    <field-address-street
                      v-model='form.billingAddress.street'
                      @update:model-value='resetFormValidation("addresses")'
                      :autofocus='$q.platform.is.desktop'
                      type='billing'
                    />
                  </div>
                  <div class='col-xs-3 col-sm-4'>
                    <field-address-post-code
                      v-model='form.billingAddress.postCode'
                      @update:model-value='resetFormValidation("addresses")'
                      :field-street='form.billingAddress.street'
                    />
                  </div>
                  <div class='col-xs-6 col-sm-4'>
                    <field-address-city
                      v-model='form.billingAddress.city'
                      @update:model-value='resetFormValidation("addresses")'
                      :field-post-code='form.billingAddress.postCode'
                    />
                  </div>
                  <div class='col-xs-6 col-sm-4'>
                    <field-address-country
                      v-model='form.billingAddress.country'
                      @update:model-value='resetFormValidation("addresses")'
                      :field-city='form.billingAddress.city'
                    />
                  </div>
                </div>
              </div>
              <q-expansion-item
                v-model='differentDeliveryAddress'
                class='different-delivery-address-toggle'
                hide-expand-icon
              >
                <template #header>
                  <q-field class='full-width' outlined>
                    <q-toggle
                      v-model='differentDeliveryAddress'
                      @update:model-value='focusDeliveryAddressField'
                      :label='$t("core.address_delivery_different")'
                      class='text-black full-width'
                    />
                  </q-field>
                </template>
                <div class='q-mt-lg'>
                  <div class='text-h5 text-bold q-mb-md'>{{ $t('core.address_delivery') }}</div>
                  <div class='row q-col-gutter-sm'>
                    <div class='col-xs-9 col-sm-12'>
                      <field-address-street
                        v-model='form.deliveryAddress.street'
                        @update:model-value='resetFormValidation("addresses")'
                        type='delivery'
                        ref='deliveryAddressFieldRef'
                      />
                    </div>
                    <div class='col-xs-3 col-sm-4'>
                      <field-address-post-code
                        v-model='form.deliveryAddress.postCode'
                        @update:model-value='resetFormValidation("addresses")'
                        :field-street='form.deliveryAddress.street'
                      />
                    </div>
                    <div class='col-xs-6 col-sm-4'>
                      <field-address-city
                        v-model='form.deliveryAddress.city'
                        @update:model-value='resetFormValidation("addresses")'
                        :field-post-code='form.deliveryAddress.postCode'
                      />
                    </div>
                    <div class='col-xs-6 col-sm-4'>
                      <field-address-country
                        v-model='form.deliveryAddress.country'
                        @update:model-value='resetFormValidation("addresses")'
                        :field-city='form.deliveryAddress.city'
                      />
                    </div>
                  </div>
                </div>
              </q-expansion-item>
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='steps.current = "basicDetails"'
                  :label='$q.screen.gt.xs ? $t("core.back") : null'
                  icon='sym_o_chevron_left'
                  color='secondary'
                  outline
                  no-caps
                />
                <q-btn
                  @click='submitForm'
                  :label='submitBtnLabel'
                  :icon='submitBtnIcon'
                  :loading='isFormSubmitted'
                  color='primary'
                  no-caps
                />
                <q-btn
                  @click='steps.current = "extraDetails"'
                  :label='$q.screen.gt.xs ? $t("core.extra_details") : null'
                  icon='sym_o_chevron_right'
                  color='secondary'
                  outline
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
          <q-step
            name='extraDetails'
            :title='$t("core.extra_details")'
            :error='steps.extraDetails.hasError'
            icon='sym_o_manage_accounts'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("extraDetails", extraDetailsFormRef)'
              ref='extraDetailsFormRef'
              class='q-gutter-md'
            >
              <field-contact-methods
                v-model='form.contactMethods'
                @focus-phone-number='focusPhoneNumberField'
                :field-phone-number='form.phoneNumber'
              />
              <field-tax-reg-number
                v-model='form.taxRegNumber'
                @update:model-value='resetFormValidation("extraDetails")'
              />
              <field-tags
                v-model='form.tags'
                @update:model-value='resetFormValidation("extraDetails")'
              />
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='steps.current = "addresses"'
                  :label='$q.screen.gt.xs ? $t("core.back") : null'
                  icon='sym_o_chevron_left'
                  color='secondary'
                  outline
                  no-caps
                />
                <q-btn
                  @click='submitForm'
                  :label='submitBtnLabel'
                  :icon='submitBtnIcon'
                  :loading='isFormSubmitted'
                  color='primary'
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
        </q-stepper>
        <div v-else class='q-pa-md'>
          <i18n-t
            keypath='contacts.msg_insert_successful'
            tag='div'
            class='text-subtitle1'
            scope='global'
          >
            <span class='text-bold'>{{ form.name }}</span>
          </i18n-t>
          <div class='q-mt-lg q-gutter-sm'>
            <q-btn
              :to='{ name: "ViewContact", params: { code: insertedContact ? insertedContact.code : null }}'
              :label='$t("contacts.view")'
              color='primary'
              icon='sym_o_person'
              no-caps
            />
            <q-btn
              @click='resetForm'
              :label='$t("contacts.add_new")'
              color='primary'
              icon='sym_o_person_add'
              outline
              no-caps
            />
            <q-btn
              v-if='props.isDialog'
              @click='emit("hide")'
              :label='$t("core.close")'
              color='secondary'
              icon='sym_o_close'
              outline
              no-caps
            />
          </div>
        </div>
      </transition>
      <q-inner-loading :showing='isLoading'>
        <q-spinner-ball size='50px' color='primary'  />
      </q-inner-loading>
    </q-card-section>
  </q-card>
</template>

<style>
.different-delivery-address-toggle .q-item {
  padding: 0;
}
</style>
