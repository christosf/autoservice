<template>
    <q-dialog
        v-model='isDialogOpen'
        @hide='resetForm'
        :maximized='$q.screen.lt.sm'
        id='add-vehicle-dialog'
        no-backdrop-dismiss
    >
        <q-card>
            <q-card-section class='q-pa-xs'>
                <q-toolbar>
                    <div class='text-h4 text-bold'>{{ $t('vehicles.new') }}</div>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section class='q-pa-none'>
                <transition name='fade' mode='out-in'>
                    <q-stepper
                        v-if='!vehicleAdded'
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
                            icon='directions_car'
                        >
                            <q-form
                                @submit='submitForm("basicDetails")'
                                @validation-error='atValidationError("basicDetails")'
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
                                        <q-item v-bind='itemProps' class='add-relation-item'>
                                            <q-item-section>
                                                <q-item-label>
                                                    <span class='text-bold'>{{ opt.name }}&nbsp;</span>
                                                    <q-chip size='sm' icon='tag' class='q-ma-none' square>{{ opt.code }}</q-chip>
                                                </q-item-label>
                                                <q-item-label caption>
                                                    {{ opt.phoneNumber }}
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                    <template v-slot:selected-item='{ opt }'>
                                        <span>{{ opt.name }}&nbsp;</span>
                                        <q-chip size='sm' icon='tag' class='q-ma-none' square>{{ opt.code }}</q-chip>
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
                                        :label='$t("core.add")'
                                        :loading='isFormSubmitted'
                                        color='primary'
                                        icon='add'
                                        no-caps
                                    />
                                    <q-btn
                                        @click='steps.current = "extraDetails"'
                                        :label='$q.screen.gt.xs ? $t("core.extra_details") : ""'
                                        color='secondary'
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
                                @validation-error='atValidationError("extraDetails")'
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
                                            :autofocus='$q.platform.is.desktop'
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
                                        color='secondary'
                                        icon='chevron_left'
                                        outline
                                    />
                                    <q-btn
                                        type='submit'
                                        :label='$t("core.add")'
                                        :loading='isFormSubmitted'
                                        color='primary'
                                        icon='add'
                                        no-caps
                                    />
                                </div>
                            </q-form>
                        </q-step>
                    </q-stepper>
                    <div v-else class='q-pa-md'>
                        <i18n-t keypath='vehicles.msg_insert_successful' tag='div' class='text-subtitle1' scope='global'>
                            <span class='text-bold'>
                                {{ form.make + ' ' + form.model }}
                            </span>
                        </i18n-t>
                        <div class='q-mt-lg q-gutter-sm'>
                            <q-btn
                                :to='{ name: "ViewVehicle", params: { code: vehicleAdded.code }}'
                                :label='$t("vehicles.view")'
                                color='primary'
                                icon='directions_car'
                                no-caps
                            />
                            <q-btn
                                @click='resetForm'
                                :label='$t("vehicles.add_new")'
                                color='primary'
                                icon='add'
                                outline
                                no-caps
                            />
                            <q-btn
                                @click='close'
                                :label='$t("core.close")'
                                color='secondary'
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
import { ref, reactive, toRaw, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useVehicleAPI, useVehicleRules } from '../../vehicles/composables'
import { useContactAPI } from '../../contacts/composables'
import { useCoreRules } from '../../core/composables'
import { useErrorLogAPI } from '../../error-log/composables'

export default {
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const { t: $t } = useI18n()

        const {
            getDistinctFieldValues,
            addVehicle,
        } = useVehicleAPI()

        const {
            regNumber,
            chassisNumber,
            fieldValueExists
        } = useVehicleRules()

        const { required } = useCoreRules()
        const { insertErrorLog } = useErrorLogAPI()
        const { filterContacts: filterContactsFn } = useContactAPI()

        const stepperRef = ref(null)
        const basicDetailsFormRef = ref(null)
        const extraDetailsFormRef = ref(null)

        const isDialogOpen = ref(false)
        const isFormSubmitted = ref(false)
        const vehicleAdded = ref(false)

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
            extraDetails: { hasError: false }
        })

        const form = reactive({
            owner: null,
            ownerId: '',
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
                v => required(v, $t('core.field_required')),
            ],
            make: [
                v => required(v, $t('core.field_required')),
            ],
            model: [
                v => required(v, $t('core.field_required')),
            ],
            regNumber: [
                v => {
                    if (!v && !form.chassisNumber) {
                        steps.basicDetails.chassisError = true
                        return $t('vehicles.msg_reg_or_chassis_required')
                    }
                    return true
                },
                v => regNumber(v, $t('vehicles.msg_reg_number_invalid')),
                v => fieldValueExists(v, 'regNumber', $t('vehicles.msg_reg_number_exists'))
            ],
            chassisNumber: [
                v => chassisNumber(v, $t('vehicles.msg_chassis_number_invalid')),
                v => fieldValueExists(v, 'chassisNumber', $t('vehicles.msg_chassis_number_exists'))
            ]
        }

        const open = owner => {
            if (owner) {
                form.owner = owner
            }
            isDialogOpen.value = true
        }

        const close = () => {
            resetForm()
            isDialogOpen.value = false
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

        const addNewTag = (value, done) => done(value, 'add-unique')

        const atValidationError = step => {
            steps.current = step
            steps[step].hasError = true
        }

        const resetFormValidation = (step, formRef) => {
            formRef.resetValidation()
            steps[step].hasError = false

            if (step === 'basicDetails') {
                steps.basicDetails.chassisError = false
            }
        }

        const resetForm = () => {
            isFormSubmitted.value = false
            vehicleAdded.value = null

            form.owner = null
            form.ownerId = ''
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

        const submitForm = async(type) => {
            isFormSubmitted.value = true

            let basicDetailsFormVal = true
            let extraDetailsFormVal = true

            if (type !== 'basicDetails' && basicDetailsFormRef.value) {
                basicDetailsFormVal = await basicDetailsFormRef.value.validate()
            }
            if (type !== 'extraDetails' && extraDetailsFormRef.value) {
                extraDetailsFormVal = await extraDetailsFormRef.value.validate()
            }

            if (basicDetailsFormVal && extraDetailsFormVal) {
                const vehicle = structuredClone(toRaw(form))
                
                // Get only the _id of the owner.
                vehicle.ownerId = vehicle.owner._id
                delete vehicle.owner
                
                addVehicle(vehicle).then(response => {
                    const { added, _id, code } = response

                    if (added) {
                        vehicleAdded.value = { _id, code }
                    } else {
                        $q.notify({
                            type: 'negative',
                            message: $t('core.error_occured')
                        })
                        isFormSubmitted.value = false
                    }
                }).catch(error => {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                    isFormSubmitted.value = false
                    insertErrorLog({
                        location: 'insertVehicleDialog',
                        path: router.currentRoute.value.fullPath,
                        metadata: error
                    })
                })
            } else {
                isFormSubmitted.value = false
            }
        }

        watchEffect(() => {
            tagsOptionList.value = tagsOptionList.value.filter(tag => !form.tags.includes(tag))
        })

        return {
            stepperRef,
            basicDetailsFormRef,
            extraDetailsFormRef,
            isDialogOpen,
            isFormSubmitted,
            vehicleAdded,
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
            filterContacts,
            filterDistinctFieldValuesNoInitial,
            filterDistinctFieldValues,
            addNewValue,
            addNewTag,
            atValidationError,
            resetFormValidation,
            resetForm,
            submitForm
        }
    }
}
</script>

<style>
#add-vehicle-dialog .q-card {
    width: 100%;
    max-width: 800px;
}

</style>
