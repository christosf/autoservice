<template>
  <q-dialog
    v-model='isDialogOpen'
    @hide='resetForm'
    :maximized='$q.screen.lt.sm'
    id='edit-contact-dialog'
    no-backdrop-dismiss
  >
    <q-card>
      <q-card-section class='q-pa-xs'>
        <q-toolbar>
          <div class='text-h4 text-bold'>{{ title }}</div>
          <q-space />
          <q-btn icon='sym_o_close' flat round dense v-close-popup />
        </q-toolbar>
      </q-card-section>
      <q-separator />
      <q-card-section class='q-pa-none'>
        <q-stepper
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
            @transition='basicDetailsFormRef.focus()'
            :title='$t("core.basic_details")'
            :error='steps.basicDetails.hasError'
            icon='sym_o_person'
          >
            <q-form
              @validation-error='atValidationError("basicDetails", basicDetailsFormRef)'
              @submit.prevent
              ref='basicDetailsFormRef'
              class='q-gutter-md'
            >
              <q-field class='contact-type q-mt-none' bottom-slots outlined>
                <q-radio
                  v-for='contactType in ContactTypesEnum'
                  v-model='form.type'
                  @update:model-value='resetFormValAndFocusNameField'
                  :label='$t(`contacts.${contactType}`)'
                  :key='contactType'
                  :val='contactType'
                  class='text-black q-pr-sm'
                />
              </q-field>
              <q-input
                v-model='form.name'
                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                ref='nameFieldRef'
                :rules='rules.name'
                :autofocus='$q.platform.is.desktop'
                lazy-rules='ondemand'
                maxlength='60'
                bottom-slots
                label-slot
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_badge' />
                </template>
                <template #label>
                  <span>
                    {{ $t(`contacts.${isCompany(form.type) ? 'company_name' : 'full_name'}`) }}
                  </span>
                  <span class='text-red-8 q-pl-xs'>*</span>
                </template>
              </q-input>
              <q-input
                v-model='form.phoneNumber'
                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                @keydown='filterInputDigitsOnly'
                :rules='rules.phoneNumber'
                lazy-rules='ondemand'
                ref='phoneNumberFieldRef'
                maxlength='20'
                type='tel'
                bottom-slots
                label-slot
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_call' />
                </template>
                <template #label>
                  <span>
                    {{ $t('contacts.phone') }}
                  </span>
                  <span class='text-red-8 q-pl-xs'>*</span>
                </template>
              </q-input>
              <q-select
                v-model='form.tags'
                @filter='filterTags'
                @new-value='addNewTag'
                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                :label='$t("core.tags")'
                :options='tagsOptionList'
                multiple
                use-chips
                use-input
                fill-input
                hide-dropdown-icon
                options-dense
                bottom-slots
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_sell' />
                </template>
                <template #no-option>
                  <div class='after-options-slot'>
                    <q-item dense>
                      <q-item-section>
                        <q-item-label class='text-caption text-italic'>
                          {{ $t('core.msg_add_new_tag') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </template>
                <template #after-options>
                  <div class='after-options-slot'>
                    <q-item dense>
                      <q-item-section>
                        <q-item-label class='text-caption text-italic'>
                          {{ $t('core.msg_add_new_tag') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </template>
              </q-select>
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='submitForm'
                  :label='$t("core.save")'
                  :loading='isFormSubmitted'
                  color='primary'
                  icon='sym_o_save'
                  no-caps
                />
                <q-btn
                  @click='steps.current = "addresses"'
                  :label='$t("contacts.addresses")'
                  color='secondary'
                  icon='sym_o_chevron_right'
                  outline
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
          <q-step
            name='addresses'
            @transition='addressesFormRef.focus()'
            :title='$t("contacts.addresses")'
            :error='steps.addresses.hasError'
            icon='sym_o_person_pin_circle'
          >
            <q-form
              @validation-error='atValidationError("addresses", addressesFormRef)'
              @submit.prevent
              ref='addressesFormRef'
              class='q-gutter-md'
            >
              <div class='q-mt-none'>
                <div class='text-h6 text-bold q-mb-md'>{{ $t('contacts.address_billing') }}</div>
                <div class='row q-col-gutter-sm'>
                  <div class='col-xs-9 col-sm-12'>
                    <q-input
                      v-model='form.billingAddress.street'
                      @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                      :label='$t("contacts.address_street")'
                      :autofocus='$q.platform.is.desktop'
                      :rules='rules.billingAddressStreet'
                      lazy-rules='ondemand'
                      maxlength='50'
                      bottom-slots
                      outlined
                    >
                      <template v-if='$q.screen.gt.xs' #prepend>
                        <q-icon name='sym_o_contact_mail' />
                      </template>
                    </q-input>
                  </div>
                  <div class='col-xs-3 col-sm-4'>
                    <q-input
                      v-model='form.billingAddress.postCode'
                      @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                      :label='$t(`contacts.address_post_code${$q.screen.lt.sm ? "_short" : ""}`)'
                      :rules='rules.billingAddressPostCode'
                      lazy-rules='ondemand'
                      maxlength='10'
                      bottom-slots
                      outlined
                    >
                      <template v-if='$q.screen.gt.xs' #prepend>
                        <q-icon name='sym_o_signpost' />
                      </template>
                    </q-input>
                  </div>
                  <div class='col-xs-6 col-sm-4'>
                    <q-input
                      v-model='form.billingAddress.city'
                      @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                      :label='$t("contacts.address_city")'
                      :rules='rules.billingAddressCity'
                      lazy-rules='ondemand'
                      maxlength='30'
                      bottom-slots
                      outlined
                    >
                      <template v-if='$q.screen.gt.xs' #prepend>
                        <q-icon name='sym_o_location_city' />
                      </template>
                    </q-input>
                  </div>
                  <div class='col-xs-6 col-sm-4'>
                    <q-input
                      v-model='form.billingAddress.country'
                      @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                      :label='$t("contacts.address_country")'
                      :rules='rules.billingAddressCountry'
                      lazy-rules='ondemand'
                      maxlength='30'
                      bottom-slots
                      outlined
                    >
                      <template v-if='$q.screen.gt.xs' #prepend>
                        <q-icon name='sym_o_flag_circle' />
                      </template>
                    </q-input>
                  </div>
                  <div class='col-12'>
                    <q-field bottom-slots outlined>
                      <q-toggle
                        v-model='isDeliveryAddressDifferent'
                        @update:model-value='focusDeliveryAddressField'
                        :label='$t("contacts.address_delivery_different")'
                        class='text-black'
                      />
                    </q-field>
                  </div>
                </div>
              </div>
              <div v-show='isDeliveryAddressDifferent'>
                <q-separator />
                <div class='q-mt-md'>
                  <div class='text-h6 text-bold q-mb-md'>{{ $t('contacts.address_delivery') }}</div>
                  <div class='row q-col-gutter-sm'>
                    <div class='col-xs-9 col-sm-12'>
                      <q-input
                        v-model='form.deliveryAddress.street'
                        @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                        :label='$t("contacts.address_street")'
                        :rules='rules.deliveryAddressStreet'
                        lazy-rules='ondemand'
                        ref='deliveryAddressFieldRef'
                        maxlength='50'
                        bottom-slots
                        outlined
                      >
                        <template v-if='$q.screen.gt.xs' #prepend>
                          <q-icon name='sym_o_local_shipping' />
                        </template>
                      </q-input>
                    </div>
                    <div class='col-xs-3 col-sm-4'>
                      <q-input
                        v-model='form.deliveryAddress.postCode'
                        @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                        :label='$t(`contacts.address_post_code${$q.screen.lt.sm ? "_short" : ""}`)'
                        :rules='rules.deliveryAddressPostCode'
                        lazy-rules='ondemand'
                        maxlength='10'
                        bottom-slots
                        outlined
                      >
                        <template v-if='$q.screen.gt.xs' #prepend>
                          <q-icon name='sym_o_signpost' />
                        </template>
                      </q-input>
                    </div>
                    <div class='col-xs-6 col-sm-4'>
                      <q-input
                        v-model='form.deliveryAddress.city'
                        @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                        :label='$t("contacts.address_city")'
                        :rules='rules.deliveryAddressCity'
                        lazy-rules='ondemand'
                        maxlength='30'
                        bottom-slots
                        outlined
                      >
                        <template v-if='$q.screen.gt.xs' #prepend>
                          <q-icon name='sym_o_location_city' />
                        </template>
                      </q-input>
                    </div>
                    <div class='col-xs-6 col-sm-4'>
                      <q-input
                        v-model='form.deliveryAddress.country'
                        @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                        :label='$t("contacts.address_country")'
                        :rules='rules.deliveryAddressCountry'
                        lazy-rules='ondemand'
                        maxlength='30'
                        bottom-slots
                        outlined
                      >
                        <template v-if='$q.screen.gt.xs' #prepend>
                          <q-icon name='sym_o_flag_circle' />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>
              <div class='q-gutter-sm q-ml-none'>
                <q-btn
                  @click='steps.current = "basicDetails"'
                  color='secondary'
                  icon='sym_o_chevron_left'
                  outline
                />
                <q-btn
                  @click='submitForm'
                  :label='$t("core.save")'
                  :loading='isFormSubmitted'
                  color='primary'
                  icon='sym_o_save'
                  no-caps
                />
                <q-btn
                  @click='steps.current = "extraDetails"'
                  :label='$q.screen.gt.xs ? $t("core.extra_details") : ""'
                  color='secondary'
                  icon='sym_o_chevron_right'
                  outline
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
          <q-step
            name='extraDetails'
            @transition='extraDetailsFormRef.focus()'
            :title='$t("core.extra_details")'
            :error='steps.extraDetails.hasError'
            icon='sym_o_manage_accounts'
          >
            <q-form
              @validation-error='atValidationError("extraDetails", extraDetailsFormRef)'
              @submit.prevent
              ref='extraDetailsFormRef'
              class='q-gutter-md'
            >
              <q-input
                v-model='form.taxRegNumber'
                :label='$t("contacts.tax_reg_number")'
                :autofocus='$q.platform.is.desktop'
                class='q-mt-none'
                maxlength='20'
                bottom-slots
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_tag' />
                </template>
              </q-input>
              <contact-methods-field
                @submit='submitContactMethod'
                @submit-edit='submitEditContactMethod'
                @remove='removeContactMethod'
                @edit-phone-number='focusPhoneNumberField'
                @order-update='contactMethodsToRaw'
                :contact-form='form'
              />
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='steps.current = "addresses"'
                  color='secondary'
                  icon='sym_o_chevron_left'
                  outline
                />
                <q-btn
                  @click='submitForm'
                  :label='$t("core.save")'
                  :loading='isFormSubmitted'
                  color='primary'
                  icon='sym_o_save'
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
        </q-stepper>
        <q-inner-loading :showing='loading'>
          <q-spinner-ball size='50px' color='primary'  />
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, reactive, toRaw, watchEffect, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useQuasar } from '../../quasar'
import { useContactAPI, useContactFunctions, useContactRules } from '../composables'
import { useCoreFunctions, useCoreRules } from '../../core/composables'
import { useErrorLogAPI } from '../../error-log/composables'

import ContactMethodsField from './ContactMethodsField.vue'

export default {
  components: {
    ContactMethodsField
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { t: $t } = useI18n()

    const {
      ContactTypesEnum,
      getContactEditableFields,
      updateContact,
      getDistinctFieldValues
    } = useContactAPI()

    const {
      required,
      optionalIfEmpty,
      minLength,
      phoneNumber
    } = useCoreRules()

    const { isCompany } = useContactFunctions()
    const { contactExists } = useContactRules()
    const { filterInputDigitsOnly } = useCoreFunctions()
    const { insertErrorLog } = useErrorLogAPI()

    const stepperRef = ref(null)
    const basicDetailsFormRef = ref(null)
    const addressesFormRef = ref(null)
    const extraDetailsFormRef = ref(null)
    const nameFieldRef = ref(null)
    const phoneNumberFieldRef = ref(null)
    const deliveryAddressFieldRef = ref(null)

    const getContactEditableFieldsQuery = getContactEditableFields.clone()
    const loading = ref(false)
    const isDialogOpen = ref(false)
    const isFormSubmitted = ref(false)
    const isDeliveryAddressDifferent = ref(false)
    const title = ref($t('contacts.edit'))
    const contactId = ref(null)
    const contactCode = ref(null)
    const tagsOptionList = ref([])

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
      tags: [],
      billingAddress: {},
      deliveryAddress: {},
      taxRegNumber: '',
      contactMethods: []
    })

    const rules = {
      name: [
        (v) => required(v, $t('core.field_required')),
        (v) => minLength(v, 3, $t('core.field_minlength', { count: 3 })),
        (v) => contactExists(v, form.phoneNumber, $t('contacts.msg_already_exists'), contactId.value)
      ],
      phoneNumber: [
        (v) => required(v, $t('core.field_required')),
        (v) => phoneNumber(v, $t('contacts.msg_phone_number_invalid'))
      ],
      billingAddressStreet: [
        (v) => minLength(v, 3, $t('core.field_minlength', { count: 3 }))
      ],
      billingAddressPostCode: [
        (v) => optionalIfEmpty(v, form.billingAddress.street, $t('core.field_required_short')),
        (v) => minLength(v, 4, $t('core.field_minlength_short', { count: 4 }))
      ],
      billingAddressCity: [
        (v) => optionalIfEmpty(v, form.billingAddress.postCode, $t('core.field_required_short')),
        (v) => minLength(v, 2, $t('core.field_minlength_short', { count: 2 }))
      ],
      billingAddressCountry: [
        (v) => optionalIfEmpty(v, form.billingAddress.city, $t('core.field_required_short')),
        (v) => minLength(v, 3, $t('core.field_minlength_short', { count: 3 }))
      ],
      deliveryAddressStreet: [
        (v) => minLength(v, 3, $t('core.field_minlength_short', { count: 3 }))
      ],
      deliveryAddressPostCode: [
        (v) => optionalIfEmpty(v, form.deliveryAddress.street, $t('core.field_required_short')),
        (v) => minLength(v, 4, $t('core.field_minlength_short', { count: 4 }))
      ],
      deliveryAddressCity: [
        (v) => optionalIfEmpty(v, form.deliveryAddress.postCode, $t('core.field_required_short')),
        (v) => minLength(v, 2, $t('core.field_minlength_short', { count: 2 }))
      ],
      deliveryAddressCountry: [
        (v) => optionalIfEmpty(v, form.deliveryAddress.city, $t('core.field_required_short')),
        (v) => minLength(v, 3, $t('core.field_minlength_short', { count: 3 }))
      ]
    }

    const filterTags = (filter, update) => {
      getDistinctFieldValues({ filter, field: 'tags' }).then((response) => {
        update(() => {
          tagsOptionList.value = response
        })
      })
    }

    const addNewTag = (value, done) => done(value, 'add-unique')

    const atValidationError = (step, formRef) => {
      steps.current = step
      steps[step].hasError = true

      nextTick(() => {
        const components = formRef.getValidationComponents()
        const component = components.find((c) => !!c.hasError)
        component.focus()
      })
    }

    const resetFormValidation = (step, formRef) => {
      formRef.resetValidation()
      steps[step].hasError = false
    }

    const resetFormValAndFocusNameField = () => {
      basicDetailsFormRef.value.resetValidation()
      nameFieldRef.value.focus()
    }

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

    const submitContactMethod = (method) => form.contactMethods.push(method)

    const submitEditContactMethod = (method, index) => {
      form.contactMethods[index].type = method.type
      form.contactMethods[index].value = method.value
      form.contactMethods[index].description = method.description
    }

    const removeContactMethod = (index) => form.contactMethods.splice(index, 1)

    const contactMethodsToRaw = () => {
      form.contactMethods.forEach((method, index) => {
        form.contactMethods[index] = toRaw(method)
      })
    }

    const resetForm = () => {
      isFormSubmitted.value = false
      isDeliveryAddressDifferent.value = false
      title.value = $t('contacts.edit')
      contactId.value = null
      contactCode.value = null

      form.type = ContactTypesEnum.INDIVIDUAL
      form.name = ''
      form.phoneNumber = ''
      form.tags.splice(0)
      form.billingAddress = {}
      form.deliveryAddress = {}
      form.taxRegNumber = ''
      form.contactMethods.splice(0)

      steps.current = 'basicDetails'
      steps.basicDetails.hasError = false
      steps.addresses.hasError = false
      steps.extraDetails.hasError = false
    }

    const fetchContact = () => {
      loading.value = true
      getContactEditableFieldsQuery.setParams({ contactId: contactId.value })
      getContactEditableFieldsQuery.fetchOne((error, contact) => {
        if (error) {
          insertErrorLog({
            location: 'getContactEditableFieldsQuery',
            path: router.currentRoute.value.fullPath,
            metadata: error
          })
          return
        }
        Object.keys(contact).forEach((field) => {
          if (field in form) {
            if (Array.isArray(contact[field])) {
              contact[field].forEach((item) => {
                form[field].push(item)
              })
            } else {
              form[field] = contact[field]
            }
          }
        })

        if (contact.deliveryAddress && Object.keys(contact.deliveryAddress).length > 0) {
          isDeliveryAddressDifferent.value = true
        }
        title.value = `${$t('core.edit')}: ${contactCode.value} - ${contact.name}`
        loading.value = false
      })
    }

    const open = (id, code) => {
      isDialogOpen.value = true
      contactId.value = id
      contactCode.value = code
      fetchContact()
    }

    const close = () => {
      isDialogOpen.value = false
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

        if (!isDeliveryAddressDifferent.value && Object.keys(contact.deliveryAddress).length > 0) {
          contact.deliveryAddress = {}
        }

        updateContact({ contactId: contactId.value, contact }).then((response) => {
          const { updated } = response

          if (updated) {
            $q.notify({
              type: 'positive',
              message: $t('contacts.msg_update_successful')
            })
            close()
          } else {
            $q.notify({
              type: 'negative',
              message: $t('core.error_occured')
            })
            isFormSubmitted.value = false
          }
        }).catch((error) => {
          if (error.error === 'no-updated-fields') {
            close()
          } else {
            $q.notify({
              type: 'negative',
              message: $t('core.error_occured')
            })
            isFormSubmitted.value = false
            insertErrorLog({
              location: 'updateContactDialog',
              path: router.currentRoute.value.fullPath,
              metadata: error
            })
          }
        })
      } else {
        isFormSubmitted.value = false
      }
    }

    watchEffect(() => {
      tagsOptionList.value = tagsOptionList.value.filter((tag) => !form.tags.includes(tag))
    })

    return {
      ContactTypesEnum,
      stepperRef,
      basicDetailsFormRef,
      addressesFormRef,
      extraDetailsFormRef,
      nameFieldRef,
      phoneNumberFieldRef,
      deliveryAddressFieldRef,
      loading,
      isDialogOpen,
      isFormSubmitted,
      isDeliveryAddressDifferent,
      title,
      tagsOptionList,
      steps,
      form,
      rules,
      isCompany,
      filterInputDigitsOnly,
      filterTags,
      addNewTag,
      atValidationError,
      resetFormValidation,
      resetFormValAndFocusNameField,
      focusDeliveryAddressField,
      focusPhoneNumberField,
      submitContactMethod,
      submitEditContactMethod,
      removeContactMethod,
      contactMethodsToRaw,
      resetForm,
      open,
      close,
      submitForm
    }
  }
}
</script>

<style scoped>
#edit-contact-dialog .q-card {
    width: 100%;
    max-width: 800px;
}

.after-options-slot .q-item {
  border-top: 1px solid rgba(0,0,0,0.1)
}

</style>
