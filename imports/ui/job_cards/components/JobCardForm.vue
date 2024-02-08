<script setup>
import { ref, reactive, computed, nextTick, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useJobCardAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'

import FieldVehicle from './fields/FieldVehicle.vue'
import FieldOwner from './fields/FieldOwner.vue'
import FieldDate from '../../core/components/fields/FieldDate.vue'
import FieldCustomerRemarks from './fields/FieldCustomerRemarks.vue'
import FieldVehicleMileage from './fields/FieldVehicleMileage.vue'
import FieldAssignedTo from './fields/FieldAssignedTo.vue'
import FieldTags from './fields/FieldTags.vue'

const props = defineProps({
  isDialog: Boolean
})
const emit = defineEmits(['hide'])

const $q = useQuasar()
const { t: $t } = useI18n()
const { notifyError, consoleLog } = useCoreFunctions()
const { insertJobCard } = useJobCardAPI()

const stepperRef = ref(null)
const basicDetailsFormRef = ref(null)
const extraDetailsFormRef = ref(null)
const customerRemarksFieldRef = ref(null)

const isFormSubmitted = ref(false)
const insertedJobCard = ref(null)

const steps = reactive({
  current: 'basicDetails',
  basicDetails: { hasError: false },
  extraDetails: { hasError: false }
})

const form = reactive({
  vehicle: null,
  vehicleId: '',
  owner: null,
  ownerId: '',
  dates: {
    startDate: '',
    startTime: '',
    dueDate: '',
    dueTime: ''
  },
  customerRemarks: '',
  vehicleMileage: '',
  vehicleMileageType: 'kms',
  assignedTo: [],
  tags: []
})

const insertedJobCardLabel = computed(() => {
  let label = ''

  if (form.vehicle.regNumber) {
    label += `${form.vehicle.regNumber} : `
  }

  label += form.vehicle.makeModel

  if (!form.vehicle.regNumber && form.vehicle.chassisNumber) {
    label += ` : ${form.vehicle.chassisNumber}`
  }

  return label
})

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
  if (step === 'extraDetails' && extraDetailsFormRef.value) {
    extraDetailsFormRef.value.resetValidation()
  }

  steps[step].hasError = false
}

const vehicleFieldUpdated = () => {
  form.vehicleId = form.vehicle && form.vehicle._id ? form.vehicle._id : ''
  form.ownerId = form.vehicle && form.vehicle.ownerId ? form.vehicle.ownerId : ''
  form.owner = form.vehicle && form.vehicle.ownerCache ? form.vehicle.ownerCache : null

  if (form.vehicle && form.vehicle.ownerCache) {
    delete form.vehicle.ownerCache
  }

  resetFormValidation('basicDetails')
}

const resetForm = () => {
  isFormSubmitted.value = false
  insertedJobCard.value = null

  form.vehicle = null
  form.vehicleId = ''
  form.owner = null
  form.ownerId = null
  form.dates = {
    startDate: '',
    startTime: '',
    dueDate: '',
    dueTime: ''
  }
  form.customerRemarks = ''
  form.vehicleMileage = ''
  form.vehicleMileageType = 'kms'
  form.assignedTo.splice(0)
  form.tags.splice(0)

  steps.current = 'basicDetails'
  steps.basicDetails.hasError = false
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
    const jobCard = structuredClone(toRaw(form))

    delete jobCard.vehicle
    delete jobCard.owner

    try {
      // @ts-ignore
      const { _id, code } = await insertJobCard({ jobCard })

      insertedJobCard.value = { _id, code }
    } catch (error) {
      consoleLog(error)
      notifyError()
    }
  }

  isFormSubmitted.value = false
}
</script>

<template>
  <q-card :flat='!props.isDialog' :bordered='!props.isDialog'>
    <q-card-section class='q-pa-xs'>
      <q-toolbar>
        <div class='text-h4 text-bold'>{{ $t('job_cards.new') }}</div>
        <q-space />
        <q-btn v-if='props.isDialog' icon='sym_o_close' flat round dense v-close-popup />
      </q-toolbar>
    </q-card-section>
    <q-separator />
    <q-card-section class='q-pa-none'>
      <transition name='fade' mode='out-in'>
        <q-stepper
          v-if='!insertedJobCard'
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
            icon='sym_o_build_circle'
          >
            <q-form
              @submit.prevent
              @validation-error='validationError("basicDetails", basicDetailsFormRef)'
              ref='basicDetailsFormRef'
              class='q-gutter-md'
            >
              <field-vehicle
                v-model='form.vehicle'
                @update:model-value='vehicleFieldUpdated'
              />
              <field-owner
                v-model='form.owner'
              />
              <field-date
                v-model='form.dates'
                @update:model-value='resetFormValidation("basicDetails")'
                @keypress-tab='customerRemarksFieldRef.focus()'
                :tabindex='2'
              />
              <field-customer-remarks
                v-model='form.customerRemarks'
                ref='customerRemarksFieldRef'
              />
              <div class='q-gutter-sm q-ml-sm'>
                <q-btn
                  @click='submitForm'
                  :label='$t("core.add")'
                  :loading='isFormSubmitted'
                  icon='sym_o_add'
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
              <field-vehicle-mileage
                v-model='form.vehicleMileage'
                v-model:type='form.vehicleMileageType'
                @update:model-value='resetFormValidation("extraDetails")'
                @update:type='resetFormValidation("extraDetails")'
                :autofocus='$q.platform.is.desktop'
              />
              <div class='row q-mb-md'>
                <div class='col'>
                  <field-assigned-to
                    v-model='form.assignedTo'
                    @update:model-value='resetFormValidation("extraDetails")'
                  />
                </div>
              </div>
              <div class='row q-mb-md'>
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
                  :label='$t("core.add")'
                  :loading='isFormSubmitted'
                  icon='sym_o_add'
                  color='primary'
                  no-caps
                />
              </div>
            </q-form>
          </q-step>
        </q-stepper>
        <div v-else class='q-pa-md'>
          <i18n-t
            keypath='job_cards.msg_insert_successful'
            tag='div'
            class='text-subtitle1'
            scope='global'
          >
            <span class='text-bold'>{{ insertedJobCardLabel }}</span>
          </i18n-t>
          <div class='q-mt-lg q-gutter-sm'>
            <q-btn
              :to='{ name: "ViewJobCard", params: { code: insertedJobCard ? insertedJobCard.code : null }}'
              :label='$t("job_cards.view")'
              color='primary'
              icon='sym_o_commute'
              no-caps
            />
            <q-btn
              @click='resetForm'
              :label='$t("job_cards.add_new")'
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
    </q-card-section>
  </q-card>
</template>
