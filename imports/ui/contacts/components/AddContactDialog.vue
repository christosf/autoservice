<template>
    <q-dialog
        v-model='isDialogOpen'
        @hide='resetForm'
        :maximized='$q.screen.lt.sm'
        id='add-contact-dialog'
        no-backdrop-dismiss
    >
        <q-card>
            <q-card-section class='q-pa-xs'>
                <q-toolbar>
                    <div class='text-h6'>{{ $t('contacts.new') }}</div>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section class='q-pa-none'>
                <transition name='fade' mode='out-in'>
                    <q-stepper
                        v-if='!contactAdded'
                        v-model='steps.current'
                        :contracted='$q.screen.lt.sm'
                        ref='stepperRef'
                        color='primary'
                        keep-alive
                        header-nav
                        animated
                        flat
                    >
                        <q-step
                            name='basicDetails'
                            @transition='basicDetailsFormRef.focus()'
                            :title='$t("core.basic_details")'
                            :error='steps.basicDetails.hasError'
                            icon='person'
                        >
                            <q-form
                                @submit='submitForm("basicDetails")'
                                @validation-error='atValidationError("basicDetails")'
                                ref='basicDetailsFormRef'
                                class='q-gutter-md'
                            >
                                <q-field class='contact-type q-mt-none' bottom-slots outlined>
                                    <q-radio
                                        v-for='contactType in ContactTypesEnum'
                                        v-model='form.type'
                                        @update:model-value='resetFormValAndFocusName'
                                        :label='$t(`contacts.${contactType}`)'
                                        :val='contactType'
                                        class='text-black q-pr-sm'
                                    />
                                </q-field>
                                <q-input
                                    v-model='form.name'
                                    @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                    :rules='rules.name'
                                    :autofocus='$q.platform.is.desktop'
                                    lazy-rules='ondemand'
                                    ref='nameFieldRef'
                                    input-class='text-uppercase'
                                    maxlength='60'
                                    bottom-slots
                                    label-slot
                                    outlined
                                >
                                    <template #prepend>
                                        <q-icon name='badge' />
                                    </template>
                                    <template #label>
                                        <span>
                                            {{ $t(`contacts.${isCompany ? 'company_name' : 'full_name'}`) }}
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
                                    maxlength='20'
                                    type='tel'
                                    bottom-slots
                                    label-slot
                                    outlined

                                >
                                    <template #prepend>
                                        <q-icon name='call' />
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
                                    input-class='text-uppercase'
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
                                        <q-icon name='sell' />
                                    </template>
                                </q-select>
                                <div class='q-gutter-sm q-ml-sm'>
                                    <q-btn
                                        type='submit'
                                        :label='$t("core.add")'
                                        :loading='isFormSubmitted'
                                        color='primary'
                                        icon='person_add'
                                        no-caps
                                    />
                                    <q-btn
                                        @click='steps.current = "addresses"'
                                        :label='$t("contacts.addresses")'
                                        color='blue-grey-10'
                                        icon='chevron_right'
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
                            icon='person_pin_circle'
                        >
                            <q-form
                                @submit='submitForm("addresses")'
                                @validation-error='atValidationError("addresses")'
                                ref='addressesFormRef'
                                class='q-gutter-sm'
                            >
                                <div class='q-mt-none'>
                                    <div class='text-body1 text-weight-medium q-mb-md'>{{ $t('contacts.billing_address') }}</div>
                                    <div class='row q-col-gutter-sm'>
                                        <div class='col-xs-9 col-sm-12'>
                                            <q-input
                                                v-model='form.billingAddress.street'
                                                @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                                                :label='$t("contacts.address_street")'
                                                :autofocus='$q.platform.is.desktop'
                                                :rules='rules.billingAddressStreet'
                                                lazy-rules='ondemand'
                                                input-class='text-uppercase'
                                                maxlength='50'
                                                bottom-slots
                                                outlined
                                            >
                                                <template v-if='$q.screen.gt.xs' #prepend>
                                                    <q-icon name='contact_mail' />
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
                                                input-class='text-uppercase'
                                                maxlength='10'
                                                bottom-slots
                                                outlined
                                            >
                                                <template v-if='$q.screen.gt.xs' #prepend>
                                                    <q-icon name='signpost' />
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
                                                input-class='text-uppercase'
                                                maxlength='30'
                                                bottom-slots
                                                outlined
                                            >
                                                <template v-if='$q.screen.gt.xs' #prepend>
                                                    <q-icon name='location_city' />
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
                                                input-class='text-uppercase'
                                                maxlength='30'
                                                bottom-slots
                                                outlined
                                            >
                                                <template v-if='$q.screen.gt.xs' #prepend>
                                                    <q-icon name='flag_circle' />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class='col-12'>
                                            <q-field bottom-slots outlined>
                                                <q-toggle
                                                    v-model='isDeliveryAddressDifferent'
                                                    @update:model-value='focusDeliveryAddressField'
                                                    :label='$t("contacts.different_delivery_address")'
                                                    class='text-black'
                                                />
                                            </q-field>
                                        </div>
                                    </div>
                                </div>
                                <div v-show='isDeliveryAddressDifferent'>
                                    <q-separator />
                                    <div class='q-mt-md'>
                                        <div class='text-body1 text-weight-medium q-mb-md'>{{ $t('contacts.delivery_address') }}</div>
                                        <div class='row q-col-gutter-sm'>
                                            <div class='col-xs-9 col-sm-12'>
                                                <q-input
                                                    v-model='form.deliveryAddress.street'
                                                    @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                                                    :label='$t("contacts.address_street")'
                                                    :rules='rules.deliveryAddressStreet'
                                                    lazy-rules='ondemand'
                                                    input-class='text-uppercase'
                                                    ref='deliveryAddressFieldRef'
                                                    maxlength='50'
                                                    bottom-slots
                                                    outlined
                                                >
                                                    <template v-if='$q.screen.gt.xs' #prepend>
                                                        <q-icon name='local_shipping' />
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
                                                    input-class='text-uppercase'
                                                    maxlength='10'
                                                    bottom-slots
                                                    outlined
                                                >
                                                    <template v-if='$q.screen.gt.xs' #prepend>
                                                        <q-icon name='signpost' />
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
                                                    input-class='text-uppercase'
                                                    maxlength='30'
                                                    bottom-slots
                                                    outlined
                                                >
                                                    <template v-if='$q.screen.gt.xs' #prepend>
                                                        <q-icon name='location_city' />
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
                                                    input-class='text-uppercase'
                                                    maxlength='30'
                                                    bottom-slots
                                                    outlined
                                                >
                                                    <template v-if='$q.screen.gt.xs' #prepend>
                                                        <q-icon name='flag_circle' />
                                                    </template>
                                                </q-input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class='q-gutter-sm q-ml-none'>
                                    <q-btn
                                        @click='steps.current = "basicDetails"'
                                        color='blue-grey-10'
                                        icon='chevron_left'
                                        outline
                                    />
                                    <q-btn
                                        type='submit'
                                        :label='$t("core.add")'
                                        :loading='isFormSubmitted'
                                        color='primary'
                                        icon='person_add'
                                        no-caps
                                    />
                                    <q-btn
                                        @click='steps.current = "extraDetails"'
                                        :label='$q.screen.gt.xs ? $t("core.extra_details") : ""'
                                        color='blue-grey-10'
                                        icon='chevron_right'
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
                            icon='manage_accounts'
                        >
                            <q-form
                                @submit='submitForm("extraDetails")'
                                @validation-error='atValidationError("extraDetails")'
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
                                        <q-icon name='tag' />
                                    </template>
                                </q-input>
                                <contact-methods-form @added='contactMethodAdded' :form='form' />
                                <div class='q-gutter-sm q-ml-sm'>
                                    <q-btn
                                        @click='steps.current = "addresses"'
                                        color='blue-grey-10'
                                        icon='chevron_left'
                                        outline
                                    />
                                    <q-btn
                                        type='submit'
                                        :label='$t("core.add")'
                                        :loading='isFormSubmitted'
                                        color='primary'
                                        icon='person_add'
                                        no-caps
                                    />
                                </div>
                            </q-form>
                        </q-step>
                    </q-stepper>
                    <div v-else class='q-pa-md'>
                        <div v-html='$t("contacts.added_what_next", { contact: form.name.toUpperCase() })' class='text-subtitle1' />
                        <div class='q-mt-lg q-gutter-sm'>
                            <q-btn
                                :to='{ name: "ViewContact", params: { code: contactAdded.code }}'
                                :label='$t("contacts.view")'
                                color='primary'
                                icon='person'
                                no-caps
                            />
                            <q-btn
                                @click='resetForm'
                                :label='$t("contacts.add_new")'
                                color='primary'
                                icon='person_add'
                                outline
                                no-caps
                            />
                            <q-btn
                                @click='close'
                                :label='$t("core.close")'
                                color='blue-grey-10'
                                icon='cancel'
                                outline
                                no-caps
                            />
                        </div>
                    </div>
                </transition>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, reactive, computed, toRaw, watchEffect, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import { useQuasar } from '../../quasar'
import { useContactsApi } from '../composables'
import { useCoreReusables } from '../../core/composables'

import ContactMethodsForm from './ContactMethodsForm.vue'

export default {
    components: {
        ContactMethodsForm
    },
    setup() {
        const $q = useQuasar()
        const { t: $t } = useI18n()

        const {
            ContactTypesEnum,
            addContact,
            contactExists,
            getDistinctFieldValues
        } = useContactsApi()

        const {
            filterInputDigitsOnly
        } = useCoreReusables()

        const stepperRef = ref(null)
        const basicDetailsFormRef = ref(null)
        const addressesFormRef = ref(null)
        const extraDetailsFormRef = ref(null)
        const nameFieldRef = ref(null)
        const deliveryAddressFieldRef = ref(null)

        const isDialogOpen = ref(true)
        const contactAdded = ref(null)
        const isFormSubmitted = ref(false)
        const isDeliveryAddressDifferent = ref(false)

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
                v => !!v || $t('core.field_required'),
                v => v.length > 2 || $t('core.field_minlength', { count: 3 }),
                () => new Promise(resolve => {
                    contactExists({
                        name: form.name,
                        phoneNumber: form.phoneNumber
                    }).then(response => {
                        if (response) {
                            resolve($t('contacts.already_exists'))
                            return
                        }
                        resolve(true)
                    })
                })
            ],
            phoneNumber: [
                v => !!v || $t('core.field_required'),
                v => /^$|^[0-9]{8,20}$/.test(v) || $t('contacts.phone_number_invalid')
            ],
            billingAddressStreet: [
                v => (!v || v.length > 2) || $t('core.field_minlength', { count: 3 })
            ],
            billingAddressPostCode: [
                v => (!!v || !form.billingAddress.street) || $t('core.field_required_short'),
                v => (!v || v.length > 3) || $t('core.field_minlength_short', { count: 4 })
            ],
            billingAddressCity: [
                v => (!!v || !form.billingAddress.postCode) || $t('core.field_required_short'),
                v => (!v || v.length > 1) || $t('core.field_minlength_short', { count: 2 })
            ],
            billingAddressCountry: [
                v => (!!v || !form.billingAddress.city) || $t('core.field_required_short'),
                v => (!v || v.length > 2) || $t('core.field_minlength_short', { count: 3 })
            ],
            deliveryAddressStreet: [
                v => (!v || v.length > 2) || $t('core.field_minlength', { count: 3 })
            ],
            deliveryAddressPostCode: [
                v => (!!v || !form.deliveryAddress.street) || $t('core.field_required_short'),
                v => (!v || v.length > 3) || $t('core.field_minlength_short', { count: 4 })
            ],
            deliveryAddressCity: [
                v => (!!v || !form.deliveryAddress.postCode) || $t('core.field_required_short'),
                v => (!v || v.length > 1) || $t('core.field_minlength_short', { count: 2 })
            ],
            deliveryAddressCountry: [
                v => (!!v || !form.deliveryAddress.city) || $t('core.field_required_short'),
                v => (!v || v.length > 2) || $t('core.field_minlength_short', { count: 3 })
            ]
        }

        const isCompany = computed(() => form.type === ContactTypesEnum.COMPANY)

        const open = () => isDialogOpen.value = true

        const close = () => {
            resetForm()
            isDialogOpen.value = false
        }

        const filterTags = (filter, update) => {
            getDistinctFieldValues({ filter, field: 'tags' }).then(response => {
                update(() => tagsOptionList.value = response)
            })
        }

        const addNewTag = (value, done) => done(value.toUpperCase(), 'add-unique')

        const atValidationError = step => {
            steps.current = step
            steps[step].hasError = true
        }

        const resetFormValidation = (step, formRef) => {
            formRef.resetValidation()
            steps[step].hasError = false
        }

        const resetFormValAndFocusName = () => {
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

        const contactMethodAdded = method => form.contactMethods.push(method)

        const resetForm = () => {
            contactAdded.value = null

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

        const submitForm = async(formType) => {
            let basicDetailsFormVal = true
            let addressesFormVal = true
            let extraDetailsFormVal = true

            if (formType !== 'basicDetails' && basicDetailsFormRef.value) {
                basicDetailsFormVal = await basicDetailsFormRef.value.validate()
            }
            if (formType !== 'addresses' && addressesFormRef.value) {
                addressesFormVal = await addressesFormRef.value.validate()
            }
            if (formType !== 'extraDetails' && extraDetailsFormRef.value) {
                extraDetailsFormVal = await extraDetailsFormRef.value.validate()
            }

            if (basicDetailsFormVal && addressesFormVal && extraDetailsFormVal) {
                isFormSubmitted.value = true
                const contact = structuredClone(toRaw(form))
                
                if (Object.keys(contact.billingAddress).length === 0) {
                    delete contact.billingAddress
                }

                if (Object.keys(contact.deliveryAddress).length === 0) {
                    delete contact.deliveryAddress
                }

                addContact(contact).then(response => {
                    contactAdded.value = response
                    isFormSubmitted.value = false
                }).catch(error => {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                    isFormSubmitted.value = false
                    console.log(error)
                })
            }
        }

        watchEffect(() => {
            // filter tags option list and remove values that are already selected.
            tagsOptionList.value = tagsOptionList.value.filter(tag => !form.tags.includes(tag))
        })

        return {
            ContactTypesEnum,
            stepperRef,
            basicDetailsFormRef,
            addressesFormRef,
            extraDetailsFormRef,
            nameFieldRef,
            deliveryAddressFieldRef,
            isDialogOpen,
            contactAdded,
            isFormSubmitted,
            isDeliveryAddressDifferent,
            tagsOptionList,
            steps,
            form,
            rules,
            isCompany,
            filterInputDigitsOnly,
            open,
            close,
            filterTags,
            addNewTag,
            atValidationError,
            resetFormValidation,
            resetFormValAndFocusName,
            focusDeliveryAddressField,
            contactMethodAdded,
            resetForm,
            submitForm
        }
    }
}
</script>


<style>
#add-contact-dialog .q-card {
    width: 100%;
    max-width: 800px;
}

#add-contact-dialog .contact-type.q-field--outlined .q-field__control {
    padding-left: 4px;
}

</style>
