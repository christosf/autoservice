<template>
    <q-dialog
        v-model='dialogOpen'
        @hide='resetForm'
        :maximized='$q.platform.is.mobile'
        id='edit-vehicle-dialog'
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
                        icon='directions_car'
                    >
                        <q-form
                            @submit='submitForm("basicDetails")'
                            @validation-error='validationError("basicDetails")'
                            ref='basicDetailsFormRef'
                            class='q-gutter-md'
                        >
                            <q-select
                                v-model='form.owner'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                @filter='filterContacts'
                                :rules='rules.owner'
                                :options='contactsOptionList'
                                :autofocus='$q.platform.is.desktop'
                                lazy-rules='ondemand'
                                input-class='text-uppercase'
                                class='q-mt-none'
                                input-debounce='400'
                                hide-dropdown-icon
                                use-input
                                bottom-slots
                                label-slot
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='person' />
                                </template>
                                <template #label>
                                    <span>
                                        {{ $t('vehicles.owner') }}
                                    </span>
                                    <span class='text-red-8 q-pl-xs'>*</span>
                                </template>
                                <template v-slot:option='{ itemProps, opt }'>
                                    <q-item v-bind='itemProps'>
                                        <q-item-section>
                                            <q-item-label>
                                                <span class='text-weight-medium'>{{ opt.name }}</span>
                                                <q-chip size='xs' icon='tag'>{{ opt.code }}</q-chip>
                                            </q-item-label>
                                            <q-item-label v-if='isCompany(opt.type)' caption>
                                                {{ opt.landlinePhone }}
                                                <template v-if='opt.mobilePhone'>/ {{ opt.mobilePhone }}</template>
                                            </q-item-label>
                                            <q-item-label v-else caption>
                                                {{ opt.mobilePhone }}
                                                <template v-if='opt.landlinePhone'>/ {{ opt.landlinePhone }}</template>
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </template>
                                <template v-slot:selected-item='{ opt }'>
                                    {{ opt.name }} <q-chip size='xs' icon='tag'>{{ opt.code }}</q-chip>
                                </template>
                            </q-select>
                            <q-select
                                v-model='form.make'
                                @filter='(value, update) => filterDistinctFieldValuesNoInitial(value, update, "make")'
                                @input-value='value => addNewValue(value, "make")'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                :rules='rules.make'
                                :options='makesOptionList'
                                lazy-rules='ondemand'
                                input-class='text-uppercase'
                                input-debounce='400'
                                maxlength='50'
                                hide-dropdown-icon
                                use-input
                                fill-input
                                hide-selected
                                options-dense
                                bottom-slots
                                label-slot
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='commute' />
                                </template>
                                <template #label>
                                    <span>
                                        {{ $t('vehicles.make') }}
                                    </span>
                                    <span class='text-red-8 q-pl-xs'>*</span>
                                </template>
                            </q-select>
                            <q-select
                                v-model='form.model'
                                @filter='(value, update) => filterDistinctFieldValuesNoInitial(value, update, "model")'
                                @input-value='value => addNewValue(value, "model")'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                :rules='rules.model'
                                :options='modelsOptionList'
                                lazy-rules='ondemand'
                                input-class='text-uppercase'
                                input-debounce='400'
                                maxlength='50'
                                hide-dropdown-icon
                                use-input
                                fill-input
                                hide-selected
                                options-dense
                                bottom-slots
                                label-slot
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='directions_car' />
                                </template>
                                <template #label>
                                    <span>
                                        {{ $t('vehicles.model') }}
                                    </span>
                                    <span class='text-red-8 q-pl-xs'>*</span>
                                </template>
                            </q-select>
                            <q-input
                                v-model='form.regNumber'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                :label='$t("vehicles.reg_number")'
                                :rules='rules.regNumber'
                                lazy-rules='ondemand'
                                input-class='text-uppercase'
                                maxlength='10'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='pin' />
                                </template>
                            </q-input>
                            <q-input
                                v-model='form.chassisNumber'
                                @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                                :label='$t("vehicles.chassis_number")'
                                :rules='rules.chassisNumber'
                                :error='steps.basicDetails.chassisError'
                                lazy-rules='ondemand'
                                input-class='text-uppercase'
                                maxlength='17'
                                bottom-slots
                                outlined
                            >
                                <template #prepend>
                                    <q-icon name='tag' />
                                </template>
                            </q-input>
                            <div class='q-gutter-sm q-ml-sm'>
                                <q-btn
                                    type='submit'
                                    :label='$t("core.save")'
                                    :loading='formSubmitted'
                                    color='primary'
                                    icon='add'
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
                        icon='settings'
                    >
                        <q-form
                            @submit='submitForm("extraDetails")'
                            @validation-error='validationError("extraDetails")'
                            :autofocus='$q.platform.is.desktop'
                            ref='extraDetailsFormRef'
                        >
                            <div class='row q-col-gutter-md q-mb-md'>
                                <div class='col q-pt-none'>
                                    <q-select
                                        v-model='form.tags'
                                        @filter='(value, update) => filterDistinctFieldValues(value, update, "tags")'
                                        @new-value='addNewTag'
                                        @update:model-value='resetFormValidation("extraDetails", extraDetailsFormRef)'
                                        :label='$t("core.tags")'
                                        :options='tagsOptionList'
                                        input-class='text-uppercase'
                                        class='q-pt-none'
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
                                </div>
                            </div>
                            <div class='row q-col-gutter-md q-mb-md'>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-select
                                        v-model='form.bodyType'
                                        @filter='(value, update) => filterDistinctFieldValues(value, update, "bodyType")'
                                        @input-value='value => addNewValue(value, "bodyType")'
                                        :label='$t("vehicles.body_type")'
                                        :options='bodyTypesOptionList'
                                        input-class='text-uppercase'
                                        input-debounce='400'
                                        maxlength='50'
                                        hide-dropdown-icon
                                        use-input
                                        fill-input
                                        hide-selected
                                        options-dense
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='commute' />
                                        </template>
                                    </q-select>
                                </div>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-select
                                        v-model='form.fuelType'
                                        @filter='(value, update) => filterDistinctFieldValues(value, update, "fuelType")'
                                        @input-value='value => addNewValue(value, "fuelType")'
                                        :label='$t("vehicles.fuel_type")'
                                        :options='fuelTypesOptionList'
                                        input-class='text-uppercase'
                                        input-debounce='400'
                                        maxlength='50'
                                        hide-dropdown-icon
                                        use-input
                                        fill-input
                                        hide-selected
                                        options-dense
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='oil_barrel' />
                                        </template>
                                    </q-select>
                                </div>
                            </div>
                            <div class='row q-col-gutter-md q-mb-md'>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-select
                                        v-model='form.drivetrain'
                                        @filter='(value, update) => filterDistinctFieldValues(value, update, "drivetrain")'
                                        @input-value='value => addNewValue(value, "drivetrain")'
                                        :label='$t("vehicles.drivetrain")'
                                        :options='drivetrainsOptionList'
                                        input-class='text-uppercase'
                                        input-debounce='400'
                                        maxlength='50'
                                        hide-dropdown-icon
                                        use-input
                                        fill-input
                                        hide-selected
                                        options-dense
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='support' />
                                        </template>
                                    </q-select>
                                </div>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-select
                                        v-model='form.gearbox'
                                        @filter='(value, update) => filterDistinctFieldValues(value, update, "gearbox")'
                                        @input-value='value => addNewValue(value, "gearbox")'
                                        :label='$t("vehicles.gearbox")'
                                        :options='gearboxesOptionList'
                                        input-class='text-uppercase'
                                        input-debounce='400'
                                        maxlength='50'
                                        hide-dropdown-icon
                                        use-input
                                        fill-input
                                        hide-selected
                                        options-dense
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='settings' />
                                        </template>
                                    </q-select>
                                </div>
                            </div>
                            <div class='row q-col-gutter-md q-mb-md'>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-select
                                        v-model='form.engine'
                                        @filter='(value, update) => filterDistinctFieldValuesNoInitial(value, update, "engine")'
                                        @input-value='value => addNewValue(value, "engine")'
                                        :label='$t("vehicles.engine")'
                                        :options='enginesOptionList'
                                        input-class='text-uppercase'
                                        input-debounce='400'
                                        maxlength='50'
                                        hide-dropdown-icon
                                        use-input
                                        fill-input
                                        hide-selected
                                        options-dense
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='cyclone' />
                                        </template>
                                    </q-select>
                                </div>
                                <div class='col-xs-12 col-sm-6'>
                                    <q-input
                                        v-model='form.modelYear'
                                        :label='$t("vehicles.model_year")'
                                        maxlength='4'
                                        mask='####'
                                        bottom-slots
                                        outlined
                                    >
                                        <template #prepend>
                                            <q-icon name='calendar_month' />
                                        </template>
                                    </q-input>
                                </div>
                            </div>
                            <div class='q-gutter-sm q-mt-sm'>
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
                                    icon='add'
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
import { ref, reactive, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useContactsApi } from '../../contacts/composables'
import { useVehiclesApi } from '../../vehicles/composables'

export default {
    setup() {
        const $q = useQuasar()
        const { t: $t } = useI18n()

        const {
            ContactTypesEnum,
            filterContacts: filterContactsFn
        } = useContactsApi()

        const {
            getVehicleEditableFields,
            fieldValueExists,
            getDistinctFieldValues,
            updateVehicle,
        } = useVehiclesApi()

        const stepperRef = ref(null)
        const basicDetailsFormRef = ref(null)
        const extraDetailsFormRef = ref(null)

        const dialogOpen = ref(false)
        const title = ref($t('vehicles.edit'))
        const formSubmitted = ref(false)
        const vehicleId = ref(null)
        const vehicleCode = ref(null)

        const contactsOptionList = ref([])
        const makesOptionList = ref([])
        const modelsOptionList = ref([])
        const tagsOptionList = ref([])
        const bodyTypesOptionList = ref([])
        const fuelTypesOptionList = ref([])
        const enginesOptionList = ref([])
        const gearboxesOptionList = ref([])
        const drivetrainsOptionList = ref([])

        const steps = reactive({
            current: 'basicDetails',
            basicDetails: {
                hasError: false,
                chassisError: false
            },
            extraDetails: {
                hasError: false
            }
        })

        const form = reactive({
            owner: null,
            make: '',
            model: '',
            regNumber: '',
            chassisNumber: '',
            tags: [],
            bodyType: '',
            fuelType: '',
            engine: '',
            gearbox: '',
            drivetrain: '',
            modelYear: ''
        })

        const rules = {
            owner: [
                val => !!val || $t('core.field_required')
            ],
            make: [
                val => !!val || $t('core.field_required')
            ],
            model: [
                val => !!val || $t('core.field_required')
            ],
            regNumber: [
                val => {
                    if (!val && !form.chassisNumber) {
                        steps.basicDetails.chassisError = true
                        return $t('vehicles.reg_or_chassis_required')
                    }
                    return true
                },
                val => /^$|^[a-zA-Z0-9]{3,10}$/.test(val) || $t('vehicles.reg_number_invalid'),
                val => new Promise(resolve => {
                    fieldValueExists({ field: 'regNumber', value: val, excludeId: vehicleId.value }).then(exists => {
                        resolve(!exists || $t('vehicles.reg_number_exists'))
                    })
                })
            ],
            chassisNumber: [
                val => /^$|^[a-zA-Z0-9]{17}$/.test(val) || $t('vehicles.chassis_number_invalid'),
                val => new Promise(resolve => {
                    fieldValueExists({ field: 'chassisNumber', value: val, excludeId: vehicleId.value }).then(exists => {
                        resolve(!exists || $t('vehicles.chassis_number_exists'))
                    })
                })
            ]
        }

        const open = (id, code) => {
            dialogOpen.value = true
            vehicleId.value = id
            vehicleCode.value = code
            fetchVehicle()
        }

        const close = () => {
            resetForm()
            dialogOpen.value = false
        }

        const isCompany = type => {
            return type === ContactTypesEnum.COMPANY
        }

        const submitForm = async(type) => {
            let basicDetailsFormVal = true
            let extraDetailsFormVal = true

            if (type !== 'basicDetails' && basicDetailsFormRef.value) {
                basicDetailsFormVal = await basicDetailsFormRef.value.validate()
            }
            if (type !== 'extraDetails' && extraDetailsFormRef.value) {
                extraDetailsFormVal = await extraDetailsFormRef.value.validate()
            }

            if (basicDetailsFormVal && extraDetailsFormVal) {
                formSubmitted.value = true
                const vehicle = structuredClone(toRaw(form))
                vehicle._id = vehicleId.value
                
                // Get only the _id of the owner.
                vehicle.ownerId = vehicle.owner._id
                delete vehicle.owner

                updateVehicle(vehicle).then(response => {
                    const { updated } = response

                    if (updated) {
                        $q.notify({
                            type: 'positive',
                            message: $t('vehicles.update_successful')
                        })
                        close()
                    } else {
                        $q.notify({
                            type: 'negative',
                            message: $t('core.error_occured')
                        })
                    }
                    formSubmitted.value = false
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
            vehicleId.value = null
            vehicleCode.value = null

            form.owner = null
            form.make = ''
            form.model = ''
            form.regNumber = ''
            form.chassisNumber = ''
            form.tags.splice(0)
            form.bodyType = ''
            form.fuelType = ''
            form.engine = ''
            form.gearbox = ''
            form.drivetrain = ''
            form.modelYear = ''

            steps.current = 'basicDetails'
            steps.basicDetails.hasError = false
            steps.basicDetails.chassisError = false
            steps.extraDetails.hasError = false
        }

        const resetFormValidation = (step, formRef) => {
            steps[step].hasError = false
            formRef.resetValidation()

            if (step === 'basicDetails') {
                steps.basicDetails.chassisError = false
            }
        }

        const validationError = step => {
            steps.current = step
            steps[step].hasError = true
        }

        const filterContacts = (filter, update) => {
            if (filter === '') {
                update(() => contactsOptionList.value = [])
                return
            }
            filterContactsFn({ filter }).then(response => {
                update(
                    () => contactsOptionList.value = response,
                    ref => {
                        if (ref.options.length === 1) {
                            ref.setOptionIndex(0)
                        }
                    }
                )
            })
        }

        const filterDistinctFieldValuesNoInitial = (filter, update, field) => {
            if (filter === '') {
                update(() => {
                    switch(field) {
                        case 'make': makesOptionList.value = []; break
                        case 'model': modelsOptionList.value = []; break
                        case 'engine': enginesOptionList.value = []; break
                    }
                })
                return
            }
            getDistinctFieldValues({ filter, field }).then(response => {
                update(() => {
                    switch(field) {
                        case 'make': makesOptionList.value = response; break
                        case 'model': modelsOptionList.value = response; break
                        case 'engine': enginesOptionList.value = response; break
                    }
                })
            })
        }

        const filterDistinctFieldValues = (filter, update, field) => {
            getDistinctFieldValues({ filter, field }).then(response => {
                update(() => {
                    switch(field) {
                        case 'tags': tagsOptionList.value = response; break
                        case 'bodyType': bodyTypesOptionList.value = response; break
                        case 'fuelType': fuelTypesOptionList.value = response; break
                        case 'gearbox': gearboxesOptionList.value = response; break
                        case 'drivetrain': drivetrainsOptionList.value = response; break
                    }
                })
            })
        }

        const addNewValue = (value, field) => form[field] = value

        const addNewTag = (value, done) => done(value.toUpperCase(), 'add-unique')

        const fetchVehicle = () => {
            const query = getVehicleEditableFields.clone({ id: vehicleId.value })
            query.fetchOne((error, vehicle) => {
                if (error) {
                    console.log(error)
                    return
                }

                Object.keys(vehicle).forEach(field => {
                    if (field in form) {
                        form[field] = vehicle[field]
                    }
                })

                title.value = vehicle.regNumber
                    ? `${$t('core.edit')}: ${vehicle.regNumber} - ${vehicle.make} ${vehicle.model}`
                    : `${$t('core.edit')}: ${vehicleCode.value} - ${vehicle.make} ${vehicle.model}`
            })
        }

        return {
            stepperRef,
            basicDetailsFormRef,
            extraDetailsFormRef,
            dialogOpen,
            title,
            formSubmitted,
            contactsOptionList,
            makesOptionList,
            modelsOptionList,
            tagsOptionList,
            bodyTypesOptionList,
            fuelTypesOptionList,
            enginesOptionList,
            gearboxesOptionList,
            drivetrainsOptionList,
            steps,
            form,
            rules,
            open,
            close,
            isCompany,
            submitForm,
            resetForm,
            resetFormValidation,
            validationError,
            filterContacts,
            filterDistinctFieldValuesNoInitial,
            filterDistinctFieldValues,
            addNewValue,
            addNewTag
        }
    }
}
</script>

<style>
#edit-vehicle-dialog .q-card {
    width: 100%;
    max-width: 800px;
}

</style>
