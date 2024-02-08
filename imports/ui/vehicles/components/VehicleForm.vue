<script setup>
import { ref, reactive, computed, nextTick, toRaw, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useVehicleStore } from '../store'
import { useVehicleAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'

import FieldOwner from './fields/FieldOwner.vue'
import FieldMake from './fields/FieldMake.vue'
import FieldModel from './fields/FieldModel.vue'
import FieldRegistrationNumber from './fields/FieldRegistrationNumber.vue'
import FieldChassisNumber from './fields/FieldChassisNumber.vue'
import FieldTags from './fields/FieldTags.vue'
import FieldBodyType from './fields/FieldBodyType.vue'
import FieldFuelType from './fields/FieldFuelType.vue'
import FieldDrivetrain from './fields/FieldDrivetrain.vue'
import FieldGearbox from './fields/FieldGearbox.vue'
import FieldEngine from './fields/FieldEngine.vue'
import FieldModelYear from './fields/FieldModelYear.vue'

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
const vehicleStore = useVehicleStore()
const { notifyError, notifySuccess, consoleLog } = useCoreFunctions()

const {
  getVehicleEditableFieldsQuery,
  insertVehicle,
  updateVehicle
} = useVehicleAPI()

const stepperRef = ref(null)
const basicDetailsFormRef = ref(null)
const extraDetailsFormRef = ref(null)
const makeFieldRef = ref(null)

const getVehicleEditableFields = getVehicleEditableFieldsQuery.clone()
const title = ref(props.type === 'insert' ? $t('vehicles.new') : $t('vehicles.edit'))
const isLoading = ref(true)
const isFormSubmitted = ref(false)
const origin = ref(null)
const vehicleId = ref('')
const vehicleCode = ref('')
const insertedVehicle = ref(null)

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
  bodyType: '',
  fuelType: '',
  engine: '',
  gearbox: '',
  drivetrain: '',
  modelYear: '',
  tags: []
})

const submitBtnLabel = computed(() => (props.type === 'update' ? $t('core.save') : $t('core.add')))
const submitBtnIcon = computed(() => (props.type === 'update' ? 'sym_o_save' : 'sym_o_add'))

const isFormVisible = computed(() => (
  !isLoading.value && ((props.type === 'insert' && !insertedVehicle.value) || (props.type === 'update'))
))

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
    steps.basicDetails.chassisError = false
  }
  if (step === 'extraDetails' && extraDetailsFormRef.value) {
    extraDetailsFormRef.value.resetValidation()
  }

  steps[step].hasError = false
}

const ownerFieldUpdated = () => {
  form.ownerId = form.owner && form.owner._id ? form.owner._id : ''
  resetFormValidation('basicDetails')
}

const resetForm = () => {
  isFormSubmitted.value = false
  insertedVehicle.value = null

  form.owner = null
  form.ownerId = ''
  form.make = ''
  form.model = ''
  form.regNumber = ''
  form.chassisNumber = ''
  form.bodyType = ''
  form.fuelType = ''
  form.engine = ''
  form.gearbox = ''
  form.drivetrain = ''
  form.modelYear = ''
  form.tags.splice(0)

  steps.current = 'basicDetails'
  steps.basicDetails.hasError = false
  steps.basicDetails.chassisError = false
  steps.extraDetails.hasError = false
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

    delete vehicle.owner

    if (props.type === 'insert') {
      try {
        // @ts-ignore
        const { _id, code } = await insertVehicle({ vehicle })

        insertedVehicle.value = { _id, code }

        if (origin.value === 'insertJobCardDialog') {
          vehicleStore.setProvidedVehicle({
            vehicle: {
              _id,
              code,
              makeModel: `${vehicle.make} ${vehicle.model}`,
              regNumber: vehicle.regNumber ? vehicle.regNumber.toUpperCase() : '',
              chassisNumber: vehicle.chassisNumber ? vehicle.chassisNumber.toUpperCase() : '',
              ownerId: vehicle.ownerId,
              ownerCache: form.owner
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
        const { updated } = await updateVehicle({ vehicleId: vehicleId.value, vehicle })

        if (updated) {
          notifySuccess($t('vehicles.msg_update_successful'))
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

const fetchVehicle = async() => {
  getVehicleEditableFields.setParams({ vehicleId: vehicleId.value })

  try {
    const vehicle = await getVehicleEditableFields.fetchOneSync()

    Object.keys(vehicle).forEach((field) => {
      if (field in form) {
        if (typeof form[field] === 'object') {
          if (Array.isArray(vehicle[field])) {
            vehicle[field].forEach((item) => {
              form[field].push(item)
            })
            return
          }
        }

        form[field] = vehicle[field]
      }
    })

    title.value = vehicle.regNumber
      ? `${$t('core.edit')}: ${vehicle.regNumber} - ${vehicle.make} ${vehicle.model}`
      : `${$t('core.edit')}: ${vehicleCode.value} - ${vehicle.make} ${vehicle.model}`
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
      if (params.owner) {
        form.owner = params.owner
        form.ownerId = params.owner._id
        nextTick(() => {
          makeFieldRef.value.focus()
        })
      }
    }

    if (props.type === 'update' && params.vehicleId && params.vehicleCode) {
      vehicleId.value = params.vehicleId
      vehicleCode.value = params.vehicleCode
      await fetchVehicle()
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
            icon='sym_o_directions_car'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("basicDetails", basicDetailsFormRef)'
              ref='basicDetailsFormRef'
            >
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col q-pt-none'>
                  <field-owner
                    v-model='form.owner'
                    @update:model-value='ownerFieldUpdated'
                    :autofocus='$q.platform.is.desktop'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col'>
                  <field-make
                    v-model='form.make'
                    @update:model-value='resetFormValidation("basicDetails")'
                    ref='makeFieldRef'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col'>
                  <field-model
                    v-model='form.model'
                    @update:model-value='resetFormValidation("basicDetails")'
                    :field-make='form.make'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col-xs-12 col-sm-6'>
                  <field-registration-number
                    v-model='form.regNumber'
                    @update:model-value='resetFormValidation("basicDetails")'
                    @chassis-field-error='steps.basicDetails.chassisError = true'
                    :field-chassis-number='form.chassisNumber'
                    :exclude-id='vehicleId'
                  />
                </div>
                <div class='col-xs-12 col-sm-6'>
                  <field-chassis-number
                    v-model='form.chassisNumber'
                    @update:model-value='resetFormValidation("basicDetails")'
                    :has-error='steps.basicDetails.chassisError'
                    :exclude-id='vehicleId'
                  />
                </div>
              </div>
              <div class='q-gutter-sm q-mt-sm'>
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
            icon='sym_o_settings'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("extraDetails", extraDetailsFormRef)'
              ref='extraDetailsFormRef'
            >
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col-xs-12 col-sm-6 q-pt-none'>
                  <field-body-type
                    v-model='form.bodyType'
                    @update:model-value='resetFormValidation("extraDetails")'
                    :autofocus='$q.platform.is.desktop'
                  />
                </div>
                <div class='col-xs-12 col-sm-6 q-pt-none'>
                  <field-fuel-type
                    v-model='form.fuelType'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col-xs-12 col-sm-6'>
                  <field-drivetrain
                    v-model='form.drivetrain'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
                <div class='col-xs-12 col-sm-6'>
                  <field-gearbox
                    v-model='form.gearbox'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col-xs-12 col-sm-6'>
                  <field-engine
                    v-model='form.engine'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
                <div class='col-xs-12 col-sm-6'>
                  <field-model-year
                    v-model='form.modelYear'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
              </div>
              <div class='row q-col-gutter-md q-mb-md'>
                <div class='col'>
                  <field-tags
                    v-model='form.tags'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
              </div>
              <div class='q-gutter-sm q-mt-sm'>
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
              </div>
            </q-form>
          </q-step>
        </q-stepper>
        <div v-else class='q-pa-md'>
          <i18n-t
            keypath='vehicles.msg_insert_successful'
            tag='div'
            class='text-subtitle1'
            scope='global'
          >
            <span class='text-bold'>{{ `${form.make} ${form.model}` }}</span>
          </i18n-t>
          <div class='q-mt-lg q-gutter-sm'>
            <q-btn
              :to='{ name: "ViewVehicle", params: { code: insertedVehicle ? insertedVehicle.code : null }}'
              :label='$t("vehicles.view")'
              color='primary'
              icon='sym_o_directions_car'
              no-caps
            />
            <q-btn
              @click='resetForm'
              :label='$t("vehicles.add_new")'
              color='primary'
              icon='sym_o_add'
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
