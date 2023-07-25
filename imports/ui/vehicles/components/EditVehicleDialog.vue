<template>
  <q-dialog
    v-model='isDialogOpen'
    @hide='resetForm'
    :maximized='$q.screen.lt.sm'
    id='edit-vehicle-dialog'
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
            icon='sym_o_directions_car'
          >
            <q-form
              @validation-error='atValidationError("basicDetails", basicDetailsFormRef)'
              @submit.prevent
              ref='basicDetailsFormRef'
            >
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col q-pt-none'>
                  <q-select
                    v-model='form.owner'
                    @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                    @input-value='atUpdateOwnerFieldInputValue'
                    @filter='filterContacts'
                    :rules='rules.owner'
                    :options='contactsOptionList'
                    :autofocus='$q.platform.is.desktop'
                    ref='ownerFieldRef'
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
                      <q-icon name='sym_o_person' />
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
                            <q-chip size='sm' icon='sym_o_tag' class='q-ma-none' square>
                              {{ opt.code }}
                            </q-chip>
                          </q-item-label>
                          <q-item-label caption>
                            {{ opt.phoneNumber }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:selected-item='{ opt }'>
                      <span>{{ opt.name }}&nbsp;</span>
                      <q-chip size='sm' icon='sym_o_tag' class='q-ma-none' square>{{ opt.code }}</q-chip>
                    </template>
                    <template #no-option>
                      <div class='after-options-slot'>
                        <q-item class='add-relation-item' dense>
                          <q-item-section>
                            <q-item-label class='text-caption'>
                              {{
                                $t(`core.${ownerInputHasValue && !isFilterContactsLoading
                                  ? 'no_results'
                                  : 'type_to_search'}`
                                )
                              }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item @click='addNewContact' class='add-relation-item' clickable dense>
                          <q-item-section>
                            <q-item-label class='text-caption text-primary'>
                              {{ $t('contacts.add_new_contact') }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                    <template #after-options>
                      <div class='after-options-slot'>
                        <q-item
                          @click='addNewContact'
                          class='add-relation-item'
                          clickable
                          dense
                        >
                          <q-item-section>
                            <q-item-label class='text-caption text-primary'>
                              {{ $t('contacts.add_new_contact') }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col'>
                  <q-select
                    v-model='form.make'
                    @filter='(value, update) => filterDistinctFieldValues(value, update, "make")'
                    @input-value='value => addNewValue(value, "make")'
                    @update:model-value='atUpdateMakeFieldModelValue'
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
                      <q-icon name='sym_o_commute' />
                    </template>
                    <template #label>
                      <span>
                        {{ $t('vehicles.make') }}
                      </span>
                      <span class='text-red-8 q-pl-xs'>*</span>
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col'>
                  <q-select
                    v-model='form.model'
                    @filter='(value, update) => filterDistinctFieldValues(value, update, "model")'
                    @input-value='value => addNewValue(value, "model")'
                    @update:model-value='resetFormValidation("basicDetails", basicDetailsFormRef)'
                    :rules='rules.model'
                    :options='modelsOptionList'
                    :disable='!form.make'
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
                      <q-icon name='sym_o_directions_car' />
                    </template>
                    <template #label>
                      <span>
                        {{ $t('vehicles.model') }}
                      </span>
                      <span class='text-red-8 q-pl-xs'>*</span>
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col-xs-12 col-sm-6'>
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
                      <q-icon name='sym_o_pin' />
                    </template>
                  </q-input>
                </div>
                <div class='col-xs-12 col-sm-6'>
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
                      <q-icon name='sym_o_tag' />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class='q-gutter-sm q-mt-sm'>
                <q-btn
                  @click='submitForm'
                  :label='$t("core.save")'
                  :loading='isFormSubmitted'
                  color='primary'
                  icon='sym_o_add'
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
            icon='sym_o_settings'
          >
            <q-form
              @validation-error='atValidationError("extraDetails", extraDetailsFormRef)'
              @submit.prevent
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
                    <q-icon name='sym_o_commute' />
                  </template>
                  <template v-slot:option='{ itemProps, opt }'>
                    <q-item v-bind='itemProps' class='add-relation-item'>
                      <q-item-section>
                        <q-item-label>{{ opt }}</q-item-label>
                      </q-item-section>
                    </q-item>
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
                      <q-icon name='sym_o_oil_barrel' />
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
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
                      <q-icon name='sym_o_support' />
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
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
                      <q-icon name='sym_o_settings' />
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
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
                      <q-icon name='sym_o_cyclone' />
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
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
                      <q-icon name='sym_o_calendar_month' />
                    </template>
                    <template v-slot:option='{ itemProps, opt }'>
                      <q-item v-bind='itemProps' class='add-relation-item'>
                        <q-item-section>
                          <q-item-label>{{ opt }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class='q-gutter-sm q-mt-sm'>
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
                  icon='sym_o_add'
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
import { ref, reactive, toRaw, watchEffect, inject, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { debounce, useQuasar } from '../../quasar'
import { useVehicleAPI, useVehicleRules } from '../composables'
import { useContactAPI } from '../../contacts/composables'
import { useCoreRules } from '../../core/composables'
import { useErrorLogAPI } from '../../error-log/composables'
import { useContactStore } from '../../contacts/store'

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { t: $t } = useI18n()

    const contactStore = useContactStore()

    const {
      getVehicleEditableFields,
      getDistinctFieldValues,
      updateVehicle
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
    const ownerFieldRef = ref(null)
    const addContactDialogRef = inject('addContactDialogRef')

    const getVehicleEditableFieldsQuery = getVehicleEditableFields.clone()
    const loading = ref(false)
    const isDialogOpen = ref(false)
    const isFormSubmitted = ref(false)
    const ownerInputHasValue = ref(false)
    const isFilterContactsLoading = ref(false)
    const title = ref($t('vehicles.edit'))
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
        (v) => required(v, $t('core.field_required'))
      ],
      make: [
        (v) => required(v, $t('core.field_required'))
      ],
      model: [
        (v) => required(v, $t('core.field_required'))
      ],
      regNumber: [
        (v) => {
          if (!v && !form.chassisNumber) {
            steps.basicDetails.chassisError = true
            return $t('vehicles.msg_reg_or_chassis_required')
          }
          return true
        },
        (v) => regNumber(v, $t('vehicles.msg_reg_number_invalid')),
        (v) => fieldValueExists(v, 'regNumber', $t('vehicles.msg_reg_number_exists'), vehicleId.value)
      ],
      chassisNumber: [
        (v) => chassisNumber(v, $t('vehicles.msg_chassis_number_invalid')),
        (v) => fieldValueExists(v, 'chassisNumber', $t('vehicles.msg_chassis_number_exists'), vehicleId.value)
      ]
    }

    const filterContacts = (filter, update) => {
      isFilterContactsLoading.value = true
      if (filter === '') {
        update(() => {
          contactsOptionList.value = []
        })
        isFilterContactsLoading.value = false
        return
      }
      filterContactsFn({ filter }).then((response) => {
        update(
          () => {
            contactsOptionList.value = response
            isFilterContactsLoading.value = false
          },
          (reference) => {
            if (reference.options.length === 1) {
              reference.setOptionIndex(0)
            }
          }
        )
      })
    }

    const filterDistinctFieldValuesNoInitial = (filter, update, field) => {
      if (filter === '') {
        update(() => {
          switch (field) {
            case 'engine': enginesOptionList.value = []; break
            default: break
          }
        })
        return
      }
      getDistinctFieldValues({ filter, field }).then((response) => {
        update(() => {
          switch (field) {
            case 'engine': enginesOptionList.value = response; break
            default: break
          }
        })
      })
    }

    const filterDistinctFieldValues = (filter, update, field) => {
      getDistinctFieldValues({ filter, field, basedOn: form.make ? form.make : '' }).then((response) => {
        update(() => {
          switch (field) {
            case 'make': makesOptionList.value = response; break
            case 'model': modelsOptionList.value = response; break
            case 'tags': tagsOptionList.value = response; break
            case 'bodyType': bodyTypesOptionList.value = response; break
            case 'fuelType': fuelTypesOptionList.value = response; break
            case 'gearbox': gearboxesOptionList.value = response; break
            case 'drivetrain': drivetrainsOptionList.value = response; break
            default: break
          }
        })
      })
    }

    const addNewValue = (value, field) => {
      form[field] = value
    }

    const addNewTag = (value, done) => done(value, 'add-unique')

    const addNewContact = () => {
      addContactDialogRef.value.open('addVehicleDialog')
      ownerFieldRef.value.updateInputValue('')
      ownerFieldRef.value.focus()
    }

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

      if (step === 'basicDetails') {
        steps.basicDetails.chassisError = false
      }
    }

    const resetForm = () => {
      isFormSubmitted.value = false
      ownerInputHasValue.value = false
      isFilterContactsLoading.value = false
      title.value = $t('vehicles.edit')
      vehicleId.value = null
      vehicleCode.value = null

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

    const fetchVehicle = () => {
      loading.value = true
      getVehicleEditableFieldsQuery.setParams({ vehicleId: vehicleId.value })

      getVehicleEditableFieldsQuery.fetchOne((error, vehicle) => {
        if (error) {
          insertErrorLog({
            location: 'getVehicleEditableFieldsQuery',
            path: router.currentRoute.value.fullPath,
            metadata: error
          })
          return
        }
        Object.keys(vehicle).forEach((field) => {
          if (field in form) {
            if (Array.isArray(vehicle[field])) {
              vehicle[field].forEach((item) => {
                form[field].push(item)
              })
            } else {
              form[field] = vehicle[field]
            }
          }
        })

        title.value = vehicle.regNumber
          ? `${$t('core.edit')}: ${vehicle.regNumber} - ${vehicle.make} ${vehicle.model}`
          : `${$t('core.edit')}: ${vehicleCode.value} - ${vehicle.make} ${vehicle.model}`

        loading.value = false
      })
    }

    const open = (id, code) => {
      isDialogOpen.value = true
      vehicleId.value = id
      vehicleCode.value = code
      fetchVehicle()
    }

    const close = () => {
      isDialogOpen.value = false
    }

    const submitForm = async() => {
      isFormSubmitted.value = true

      let basicDetailsFormVal = true
      let extraDetailsFormVal = true

      if (basicDetailsFormRef.value) {
        basicDetailsFormVal = await basicDetailsFormRef.value.validate()
      }
      if (extraDetailsFormRef.value) {
        extraDetailsFormVal = await extraDetailsFormRef.value.validate()
      }

      if (basicDetailsFormVal && extraDetailsFormVal) {
        const vehicle = structuredClone(toRaw(form))

        // Get only the _id of the owner.
        vehicle.ownerId = vehicle.owner._id
        delete vehicle.owner

        updateVehicle({ vehicleId: vehicleId.value, vehicle }).then((response) => {
          const { updated } = response

          if (updated) {
            $q.notify({
              type: 'positive',
              message: $t('vehicles.msg_update_successful')
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

    const atUpdateOwnerFieldInputValue = debounce((value) => {
      ownerInputHasValue.value = (value !== '')
    }, 500)

    const atUpdateMakeFieldModelValue = () => {
      resetFormValidation('basicDetails', basicDetailsFormRef.value)
      form.model = ''
    }

    contactStore.$onAction(({ name, after }) => {
      if (name === 'setAddedContact') {
        after(() => {
          form.owner = contactStore.getAddedContact
          contactStore.resetAddedContact()

          nextTick(() => {
            addContactDialogRef.value.close()
            ownerFieldRef.value.hidePopup()
          })
        })
      }
    })

    watchEffect(() => {
      tagsOptionList.value = tagsOptionList.value.filter((tag) => !form.tags.includes(tag))
    })

    return {
      stepperRef,
      basicDetailsFormRef,
      extraDetailsFormRef,
      addContactDialogRef,
      ownerFieldRef,
      ownerInputHasValue,
      isFilterContactsLoading,
      loading,
      isDialogOpen,
      isFormSubmitted,
      title,
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
      filterContacts,
      filterDistinctFieldValuesNoInitial,
      filterDistinctFieldValues,
      addNewValue,
      addNewTag,
      addNewContact,
      atValidationError,
      resetFormValidation,
      resetForm,
      submitForm,
      open,
      close,
      atUpdateOwnerFieldInputValue,
      atUpdateMakeFieldModelValue
    }
  }
}
</script>

<style>
#edit-vehicle-dialog .q-card {
  width: 100%;
  max-width: 800px;
}

.after-options-slot .q-item {
  border-top: 1px solid rgba(0,0,0,0.1)
}

</style>
