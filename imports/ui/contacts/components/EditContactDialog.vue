<template>
    <q-dialog
        v-model='dialogOpen'
        @hide='resetForm'
        :maximized='$q.platform.is.mobile'
        id='edit-contact-dialog'
        no-backdrop-dismiss
    >
        <q-card>
            <q-card-section class='q-pa-sm'>
                <q-toolbar>
                    <div class='text-h6'>{{ title }}</div>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
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
                            @validation-error='validationError("basicDetails")'
                            ref='basicDetailsFormRef'
                            class='q-gutter-md'
                        >
                            <q-field class='contact-type q-mt-none' bottom-slots outlined>
                                <q-radio
                                    v-for='contactType in ContactTypesEnum'
                                    v-model='form.type'
                                    @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef); nameFieldRef.focus()'
                                    :label='$t(`contacts.${contactType}`)'
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
                                v-show='isIndividual'
                                v-model='form.mobilePhone'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                @keydown='allowOnlyDigits'
                                :error='steps.basicDetails.mobileError'
                                :rules='rules.mobilePhone'
                                lazy-rules='ondemand'
                                maxlength='20'
                                type='tel'
                                bottom-slots
                                label-slot
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='smartphone' />
                                </template>
                                <template #label>
                                    <span>
                                        {{ $t('contacts.mobile_phone') }}
                                    </span>
                                    <span class='text-red-8 q-pl-xs'>*</span>
                                </template>
                            </q-input>
                            <q-input
                                v-model='form.landlinePhone'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                @keydown='allowOnlyDigits'
                                :error='steps.basicDetails.landlineError'
                                :rules='rules.landlinePhone'
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
                                        {{ $t('contacts.landline_phone') }}
                                    </span>
                                    <span v-show='isCompany' class='text-red-8 q-pl-xs'>*</span>
                                </template>
                            </q-input>
                            <q-input
                                v-show='isCompany'
                                v-model='form.mobilePhone'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                @keydown='allowOnlyDigits'
                                :label='$t("contacts.mobile_phone")'
                                :rules='rules.mobilePhone'
                                lazy-rules='ondemand'
                                maxlength='20'
                                type='tel'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='smartphone' />
                                </template>
                            </q-input>
                            <div class='q-gutter-sm q-ml-sm'>
                                <q-btn
                                    type='submit'
                                    :label='$t("core.save")'
                                    :loading='formSubmitted'
                                    color='primary'
                                    icon='save'
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
                            @validation-error='validationError("addresses")'
                            :autofocus='$q.platform.is.desktop'
                            ref='addressesFormRef'
                            class='q-gutter-md'
                        >
                            <q-table
                                :columns='addressesFieldColumns'
                                :rows='form.addresses'
                                :rows-per-page-options='[0]'
                                class='addresses-table q-mt-none'
                                hide-pagination
                                bordered
                                flat
                            >
                                <template #header-cell-postalCode>
                                    <th class='text-left'>
                                        <span>
                                            {{ $t('contacts.address_postal_code_short') }}
                                            <q-tooltip anchor='top middle' self='bottom middle'>
                                                {{ $t('contacts.address_postal_code') }}
                                            </q-tooltip>
                                        </span>
                                    </th>
                                </template>
                                <template #body-cell-index='{ rowIndex }'>
                                    <td class='text-center' style='width: 40px; font-size: 14px;'>
                                        {{ rowIndex + 1 }}
                                    </td>
                                </template>
                                <template #body-cell-street='{ row: address, rowIndex: index }'>
                                    <td class='text-left' style='min-width: 200px;'>
                                        <q-input
                                            v-model='address.street'
                                            @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                                            :placeholder='`${$t("contacts.add_new")}...`'
                                            :rules='rules[`street_${index}`]'
                                            lazy-rules='ondemand'
                                            input-class='text-uppercase'
                                            maxlength='50'
                                            hide-bottom-space
                                            borderless
                                            dense
                                        />
                                    </td>
                                </template>
                                <template #body-cell-city='{ row: address, rowIndex: index }'>
                                    <td class='text-left' style='width: 20%; min-width: 150px;'>
                                        <q-input
                                            v-model='address.city'
                                            @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                                            :rules='rules[`city_${index}`]'
                                            lazy-rules='ondemand'
                                            input-class='text-uppercase'
                                            maxlength='30'
                                            hide-bottom-space
                                            borderless
                                            dense
                                        />
                                    </td>
                                </template>
                                <template #body-cell-postalCode='{ row: address, rowIndex: index }'>
                                    <td class='text-left' style='width: 20%; min-width: 70px;'>
                                        <q-input
                                            v-model='address.postalCode'
                                            @update:model-value='resetFormValidation("addresses", addressesFormRef)'  
                                            :rules='rules[`postalCode_${index}`]'
                                            lazy-rules='ondemand'                                              
                                            input-class='text-uppercase'
                                            maxlength='10'
                                            hide-bottom-space
                                            borderless
                                            dense
                                        />
                                    </td>
                                </template>
                                <template #body-cell-type='{ row: address, rowIndex: index }'>
                                    <td class='text-left' style='width: 140px;'>
                                        <q-select
                                            v-model='address.type'
                                            @update:model-value='resetFormValidation("addresses", addressesFormRef)'
                                            :options='addressTypeOptionList'
                                            :rules='rules[`type_${index}`]'
                                            lazy-rules='ondemand'
                                            hide-bottom-space
                                            emit-value
                                            map-options
                                            borderless
                                            options-dense
                                            dense
                                        />
                                    </td>
                                </template>
                            </q-table>
                            <div class='q-gutter-sm q-ml-sm'>
                                <q-btn
                                    @click='steps.current = "basicDetails"'
                                    color='blue-grey-10'
                                    icon='chevron_left'
                                    outline
                                />
                                <q-btn
                                    type='submit'
                                    :label='$t("core.save")'
                                    :loading='formSubmitted'
                                    color='primary'
                                    icon='save'
                                    no-caps
                                />
                                <q-btn
                                    @click='steps.current = "extraDetails"'
                                    :label='$t("core.extra_details")'
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
                            @validation-error='validationError("extraDetails")'
                            :autofocus='$q.platform.is.desktop'
                            ref='extraDetailsFormRef'
                            class='q-gutter-md'
                        >
                            <q-select
                                v-model='form.tags'
                                @filter='filterTags'
                                @new-value='addNewTag'
                                @update:model-value='resetFormValidation("extraDetails", extraDetailsFormRef)'
                                :label='$t("core.tags")'
                                :options='tagsOptionList'
                                input-class='text-uppercase'
                                class='q-mt-none'
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
                            <q-input
                                v-model='form.email'
                                @update:model-value='resetFormValidation("extraDetails", extraDetailsFormRef)'
                                :rules='rules.email'
                                :label='$t("contacts.email")'
                                lazy-rules='ondemand'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='contact_mail' />
                                </template>
                            </q-input>
                            <q-input
                                v-model='form.website'
                                @update:model-value='resetFormValidation("extraDetails", extraDetailsFormRef)'
                                :rules='rules.website'
                                :label='$t("contacts.website")'
                                lazy-rules='ondemand'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='travel_explore' />
                                </template>
                            </q-input>
                            <q-input
                                v-if='isCompany'
                                v-model='form.taxIdNumber'
                                :label='$t("contacts.vat_number")'
                                maxlength='20'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='tag' />
                                </template>
                            </q-input>
                            <div class='q-gutter-sm q-ml-sm'>
                                <q-btn
                                    @click='steps.current = "addresses"'
                                    color='blue-grey-10'
                                    icon='chevron_left'
                                    outline
                                />
                                <q-btn
                                    type='submit'
                                    :label='$t("core.save")'
                                    :loading='formSubmitted'
                                    color='primary'
                                    icon='save'
                                    no-caps
                                />
                            </div>
                        </q-form>
                    </q-step>
                </q-stepper>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, reactive, computed, toRaw, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { isURL, isEmail } from 'validator'
import { useQuasar } from '../../quasar'
import { useContactsApi, useContactsReusables } from '../composables'
import { useCoreReusables } from '../../core/composables'

export default {
    setup() {
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const {
            AddressTypesEnum,
            ContactTypesEnum,
            getContactEditableFields,
            getDistinctFieldValues,
            contactExists,
            updateContact
        } = useContactsApi()

        const {
            addressesFieldColumns,
            addressTypeOptionList
        } = useContactsReusables()

        const {
            allowOnlyDigits
        } = useCoreReusables()

        const stepperRef = ref(null)
        const basicDetailsFormRef = ref(null)
        const addressesFormRef = ref(null)
        const extraDetailsFormRef = ref(null)
        const nameFieldRef = ref(null)

        const dialogOpen = ref(false)
        const title = ref($t('contacts.edit'))
        const formSubmitted = ref(false)
        const contactId = ref(null)
        const contactCode = ref(null)

        const tagsOptionList = ref([])

        const steps = reactive({
            current: 'basicDetails',
            basicDetails: {
                hasError: false,
                mobileError: false,
                landlineError: false
            },
            addresses: {
                hasError: false
            },
            extraDetails: {
                hasError: false
            }
        })

        const form = reactive({
            type: ContactTypesEnum.INDIVIDUAL,
            name: '',
            mobilePhone: '',
            landlinePhone: '',
            addresses: [{ street: '', city: '', postalCode: '', type: '' }],
            tags: [],
            email: '',
            website: '',
            taxIdNumber: ''
        })

        const isCompany = computed(() => form.type === ContactTypesEnum.COMPANY)
        
        const isIndividual = computed(() => form.type === ContactTypesEnum.INDIVIDUAL)

        const rules = {
            name: [
                val => !!val || $t('core.field_required'),
                val => val.length > 2 || $t('core.field_minlength', { count: 3 }),
                () => new Promise(resolve => {
                    contactExists({
                        type: form.type,
                        name: form.name,
                        phone: isIndividual.value ? form.mobilePhone : form.landlinePhone,
                        excludeId: contactId.value
                    }).then(response => {
                        if (response) {
                            if (isIndividual.value) {
                                steps.basicDetails.mobileError = true
                            } else {
                                steps.basicDetails.landlineError = true
                            }                      
                            resolve($t('contacts.already_exists'))
                            return
                        }
                        resolve(true)
                    })
                })
            ],
            mobilePhone: [
                val => (!!val || isCompany.value) || $t('core.field_required'),
                val => /^$|^[0-9]{8,20}$/.test(val) || $t('contacts.phone_invalid'),
                val => (!val || val.startsWith('9')) || $t('contacts.phone_not_mobile')
            ],
            landlinePhone: [
                val => (!!val || isIndividual.value) || $t('core.field_required'),
                val => /^$|^[0-9]{8,20}$/.test(val) || $t('contacts.phone_invalid'),
                val => (!val || val.startsWith('2')) || $t('contacts.phone_not_landline')
            ],
            email: [
                val => (!val || isEmail(val)) || $t('contacts.email_invalid')
            ],
            website: [
                val => (!val || isURL(val)) || $t('contacts.website_invalid')
            ]
        }

        const open = (id, code) => {
            dialogOpen.value = true
            contactId.value = id
            contactCode.value = code
            fetchUser()
        }

        const close = () => {
            resetForm()
            dialogOpen.value = false
        }

        const submitForm = async(type) => {
            let basicDetailsFormVal = true
            let addressesFormVal = true
            let extraDetailsFormVal = true

            if (type !== 'basicDetails' && basicDetailsFormRef.value) {
                basicDetailsFormVal = await basicDetailsFormRef.value.validate()
            }
            if (type !== 'addresses' && addressesFormRef.value) {
                addressesFormVal = await addressesFormRef.value.validate()
            }
            if (type !== 'extraDetails' && extraDetailsFormRef.value) {
                extraDetailsFormVal = await extraDetailsFormRef.value.validate()
            }

            if (basicDetailsFormVal && addressesFormVal && extraDetailsFormVal) {
                formSubmitted.value = true
                const contact = structuredClone(toRaw(form))

                // Always remove last table row because it is empty.
                contact.addresses.pop()                
                
                updateContact({ _id: contactId.value, contact }).then(response => {
                    const { updated } = response

                    if (updated) {
                        $q.notify({
                            type: 'positive',
                            message: $t('contacts.update_successful')
                        })
                        close()
                    } else {
                        $q.notify({
                            type: 'negative',
                            message: $t('core.error_occured')
                        })
                        formSubmitted.value = false
                    }
                }).catch(error => {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                    formSubmitted.value = false
                    console.log(error)
                })
            }
        }

        const resetForm = () => {
            contactId.value = null
            contactCode.value = null

            form.type = ContactTypesEnum.INDIVIDUAL
            form.name = ''
            form.mobilePhone = ''
            form.landlinePhone = ''
            form.addresses.splice(0)
            form.addresses.push({ street: '', city: '', postalCode: '', type: '' })
            form.tags.splice(0)
            form.email = ''
            form.website = ''
            form.taxIdNumber = ''

            steps.current = 'basicDetails'
            steps.basicDetails.hasError = false
            steps.basicDetails.mobileError = false
            steps.basicDetails.landlineError = false
            steps.addresses.hasError = false
            steps.extraDetails.hasError = false

            formSubmitted.value = false
        }

        const resetFormValidation = (step, formRef) => {
            steps[step].hasError = false
            formRef.resetValidation()

            if (step === 'basicDetails') {
                steps.basicDetails.mobileError = false
                steps.basicDetails.landlineError = false
            }
        }

        const validationError = step => {
            steps.current = step
            steps[step].hasError = true
        }

        const filterTags = (filter, update) => {
            getDistinctFieldValues({ filter, field: 'tags' }).then(response => {
                update(() => tagsOptionList.value = response)
            })
        }

        const addNewTag = (value, done) => done(value.toUpperCase(), 'add-unique')

        const fetchUser = () => {
            const query = getContactEditableFields.clone({ id: contactId.value })
            query.fetchOne((error, contact) => {
                if (error) {
                    console.log(error)
                    return
                }
                Object.keys(contact).forEach(field => {
                    if (field in form) {
                        if (Array.isArray(contact[field])) {
                            contact[field].forEach(item => {
                                form[field].push(item)
                            })
                        } else {
                            form[field] = contact[field]
                        }
                    }
                })
                title.value = `${$t('core.edit')}: ${contactCode.value} - ${contact.name}`
            })
        }

        watchEffect(() => {
            tagsOptionList.value = tagsOptionList.value.filter(tag => !form.tags.includes(tag))
        })

        watch(form.addresses, () => {
            const lastRow = form.addresses[form.addresses.length - 1]

            // Add new row if at least one field of the row has value.
            if (lastRow.street || lastRow.city || lastRow.postalCode || lastRow.type) {
                form.addresses.push({ street: '', city: '', postalCode: '', type: '' })
            }

            let invoiceAddressExists = false
            let deliveryAddressExists = false
            form.addresses.forEach((address, index) => {
                // Check if there is already address with the following
                // types and disable the corresponding options.
                if (address.type === AddressTypesEnum.INVOICE) {
                    invoiceAddressExists = true
                }
                if (address.type === AddressTypesEnum.DELIVERY) {
                    deliveryAddressExists = true
                }

                // Remove empty rows if it is not the last one.
                if (index !== form.addresses.length - 1 && !address.street && !address.city && !address.postalCode && !address.type) {
                    form.addresses.splice(index, 1)
                }

                // Create dynamic rules for each added address.
                rules[`street_${index}`] = [
                    val => {
                        if (form.addresses[index].type && !val) {
                            return $t('core.required')
                        }
                        return true
                    },
                    val => (!val || val.length > 2) || $t('core.field_minlength', { count: 3 })
                ]
                rules[`city_${index}`] = [
                    val => {
                        if (form.addresses[index].street && !val) {
                            return $t('core.required')
                        }
                        return true
                    },
                    val => (!val || val.length > 1) || $t('core.field_minlength', { count: 2 }),
                ]
                rules[`postalCode_${index}`] = [
                    val => {
                        if (form.addresses[index].street && !val) {
                            return $t('core.required')
                        }
                        return true
                    },
                    val => (!val || val.length > 3) || $t('core.field_minlength', { count: 4 }),
                ]
                rules[`type_${index}`] = [
                    val => {
                        if (form.addresses[index].street && !val) {
                            return $t('core.required')
                        }
                        return true
                    }
                ]
            })
            if (invoiceAddressExists) {
                addressTypeOptionList[1].disable = true
            } else {
                addressTypeOptionList[1].disable = false
            }
            if (deliveryAddressExists) {
                addressTypeOptionList[2].disable = true
            } else {
                addressTypeOptionList[2].disable = false
            }
        })

        return {
            ContactTypesEnum,
            stepperRef,
            basicDetailsFormRef,
            addressesFormRef,
            extraDetailsFormRef,
            nameFieldRef,
            addressesFieldColumns,
            addressTypeOptionList,
            dialogOpen,
            title,
            formSubmitted,
            tagsOptionList,
            steps,
            form,
            rules,
            isCompany,
            isIndividual,
            allowOnlyDigits,
            open,
            close,
            submitForm,
            resetForm,
            resetFormValidation,
            validationError,
            filterTags,
            addNewTag
        }
    }
}
</script>

<style>
#edit-contact-dialog .q-card {
    width: 100%;
    max-width: 800px;
}

#edit-contact-dialog .addresses-table .q-table td,
#edit-contact-dialog .addresses-table .q-table th {
    padding: 7px;
}

#edit-contact-dialog .contact-type.q-field--outlined .q-field__control {
    padding-left: 4px;
}

</style>