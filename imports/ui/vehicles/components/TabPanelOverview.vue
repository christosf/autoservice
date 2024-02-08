<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useVehicleAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'
import InternalNotesCard from '../../core/components/InternalNotesCard.vue'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t: $t } = useI18n()
const { updateNotes } = useVehicleAPI()
const { notifySuccess, notifyError, unsavedChangesDialog } = useCoreFunctions()

const notesCardRef = ref(null)
const notesCardModel = ref('')
const isNotesCardSubmitted = ref(false)

const detailFields = computed(() => [
  {
    label: $t('vehicles.make'),
    value: props.vehicle.make,
    icon: 'sym_o_factory'
  },
  {
    label: $t('vehicles.model'),
    value: props.vehicle.model,
    icon: 'sym_o_directions_car'
  },
  {
    label: $t('vehicles.model_year'),
    value: props.vehicle.modelYear,
    icon: 'sym_o_calendar_month'
  },
  {
    label: $t('vehicles.body_type'),
    value: props.vehicle.bodyType,
    icon: 'commute'
  },
  {
    label: $t('vehicles.fuel_type'),
    value: props.vehicle.fuelType,
    icon: 'sym_o_oil_barrel'
  },
  {
    label: $t('vehicles.drivetrain'),
    value: props.vehicle.drivetrain,
    icon: 'sym_o_support'
  },
  {
    label: $t('vehicles.gearbox'),
    value: props.vehicle.gearbox,
    icon: 'sym_o_settings'
  },
  {
    label: $t('vehicles.engine'),
    value: props.vehicle.engine,
    icon: 'sym_o_cyclone'
  }
])

const isNotesCardBtnDisabled = computed(() => (
  (notesCardModel.value && notesCardModel.value.trim() === props.vehicle.notes)
  || (notesCardModel.value === '' && !props.vehicle.notes)
))

const submitNotes = async() => {
  isNotesCardSubmitted.value = true

  // @ts-ignore
  const { updated } = await updateNotes({ vehicleId: props.vehicle._id, notes: notesCardModel.value })

  if (updated) {
    notifySuccess($t('core.msg_notes_update_successful'))
  } else {
    notifyError()
  }

  isNotesCardSubmitted.value = false
  notesCardRef.value.focus()
}

watchEffect(() => {
  notesCardModel.value = props.vehicle.notes ? props.vehicle.notes : ''
})

onBeforeRouteUpdate((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.vehicle.notes ? props.vehicle.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})

onBeforeRouteLeave((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.vehicle.notes ? props.vehicle.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})
</script>

<template>
  <div class='row q-col-gutter-sm'>
    <div class='col-xs-12 col-sm-12 col-md-7'>
      <div class='q-gutter-sm'>

        <q-card bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('vehicles.identification') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item v-if='props.vehicle.regNumber' class='q-py-sm'>
                <q-item-section avatar>
                  <q-icon name='pin' color='primary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ props.vehicle.regNumber }}</q-item-label>
                  <q-item-label caption>{{ $t('vehicles.reg_number') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if='props.vehicle.chassisNumber' class='q-py-sm'>
                <q-item-section avatar>
                  <q-icon name='tag' color='primary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ props.vehicle.chassisNumber }}</q-item-label>
                  <q-item-label caption>{{ $t('vehicles.chassis_number') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('vehicles.owner') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-item
              :to='{ name: "ViewContact", params: { code: props.vehicle.owner.code }}'
              class='q-py-sm'
              clickable
            >
              <q-item-section avatar>
                <q-icon name='person' color='primary' />
              </q-item-section>
              <q-item-section class='text-body2'>
                <q-item-label class='text-secondary'>
                  {{ props.vehicle.owner.name }}
                </q-item-label>
                <q-item-label class='text-grey'>
                  {{ props.vehicle.owner.phoneNumber }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>

        <internal-notes-card
          v-model='notesCardModel'
          @submit='submitNotes'
          :disabled='isNotesCardBtnDisabled'
          :submitted='isNotesCardSubmitted'
          ref='notesCardRef'
        />
      </div>
    </div>
    <div class='col-xs-12 col-sm-12 col-md-5'>
      <div class='q-gutter-sm'>

        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm border-bottom'>
            {{ $t('core.tags') }}
          </q-card-section>
          <q-card-section v-if='props.vehicle.tags && props.vehicle.tags.length > 0' class='q-py-sm'>
            <q-chip v-for='tag in props.vehicle.tags' :key='tag' class='q-ma-none q-mr-sm' square>
              {{ tag }}
            </q-chip>
          </q-card-section>
          <q-card-section v-else class='text-caption text-grey q-py-sm'>
            {{ $t('core.none') }}
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('vehicles.details') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <template v-for='field in detailFields'>
                <q-item v-if='field.value' :key='field.value'>
                  <q-item-section avatar>
                    <q-icon :name='field.icon' color='secondary' />
                  </q-item-section>
                  <q-item-section class='text-body2'>
                    <q-item-label class='text-bold'>{{ field.label }}</q-item-label>
                    <q-item-label>{{ field.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
