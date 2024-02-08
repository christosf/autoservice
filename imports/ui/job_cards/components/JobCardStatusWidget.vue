<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useJobCardAPI, useJobCardFunctions } from '../composables'
import { useCoreFunctions } from '../../core/composables'

const props = defineProps({
  jobCard: {
    type: Object,
    required: true
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { updateStatus, JobCardStatusesEnum } = useJobCardAPI()
const { jobCardStatusLabel, jobCardStatusColor } = useJobCardFunctions()
const { notifySuccess } = useCoreFunctions()
const jobCardStatusKeys = Object.keys(JobCardStatusesEnum)

const extraOptionsHidden = computed(() => (
  ![JobCardStatusesEnum.COMPLETED, JobCardStatusesEnum.CANCELED].includes(props.jobCard.status)
))

const statusIsSelected = (status) => status === props.jobCard.status

const statusIsAvailable = (status) => (
  ![JobCardStatusesEnum.CANCELED, JobCardStatusesEnum.COMPLETED].includes(status)
)

const changeStatus = async(status) => {
  if (status === props.jobCard.status) {
    return
  }

  try {
    await updateStatus({ jobCardId: props.jobCard._id, status })
    notifySuccess($t('job_cards.msg_status_updated'))
  } catch (error) {
    console.log(error)
  }
}

const nextStatus = async() => {
  let status = JobCardStatusesEnum.OPEN

  switch (props.jobCard.status) {
    case JobCardStatusesEnum.OPEN: status = JobCardStatusesEnum.ONGOING; break
    case JobCardStatusesEnum.ONGOING: status = JobCardStatusesEnum.AWAITING_REVIEW; break
    case JobCardStatusesEnum.AWAITING_REVIEW: status = JobCardStatusesEnum.COMPLETED; break
    default: break
  }

  changeStatus(status)
}
</script>

<template>
  <q-btn-group outline unelevated>
    <q-btn
      :label='jobCardStatusLabel(props.jobCard.status)'
      :color='jobCardStatusColor(props.jobCard.status)'
      padding='xs sm'
      size='13px'
      outline
      no-caps
    >
      <q-menu
        :offset='[0,5]'
        anchor='bottom left'
        self='top left'
        class='custom-dropdown-menu'
        auto-close
      >
        <q-list style='min-width: 220px;' separator>
          <!--
          <q-item class='bg-grey-1' dense>
            <q-item-section>
              <q-item-label class='text-caption text-bold'>{{ $t('job_cards.status') }}</q-item-label>
            </q-item-section>
          </q-item>
          -->
          <template v-for='(key) in jobCardStatusKeys' :key='key'>
            <q-item
              v-if='statusIsAvailable(JobCardStatusesEnum[key])'
              @click='changeStatus(JobCardStatusesEnum[key])'
              class='q-px-xs'
              clickable
            >
              <q-item-section avatar>
                <q-icon
                  :color='jobCardStatusColor(JobCardStatusesEnum[key])'
                  name='fiber_manual_record'
                />
              </q-item-section>
              <q-item-section>
                <q-item-label :class='{"text-bold": statusIsSelected(JobCardStatusesEnum[key])}'>
                  {{ $t(`job_cards.status_${key.toLowerCase()}`) }}
                </q-item-label>
              </q-item-section>
              <q-item-section v-if='statusIsSelected(JobCardStatusesEnum[key])' avatar>
                <q-icon name='sym_o_check' />
              </q-item-section>
            </q-item>
          </template>
          <q-item
            v-if='props.jobCard.status !== JobCardStatusesEnum.CANCELED'
            @click='changeStatus(JobCardStatusesEnum.CANCELED)'
            class='q-px-xs bg-red-1'
            clickable
          >
            <q-item-section avatar>
              <q-icon
                :color='jobCardStatusColor(JobCardStatusesEnum.CANCELED)'
                name='fiber_manual_record'
              />
            </q-item-section>
            <q-item-section>
              <q-item-label :class='{"text-bold": statusIsSelected(JobCardStatusesEnum.CANCELED)}'>
                {{ $t('core.cancel') }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if='statusIsSelected(JobCardStatusesEnum.CANCELED)' avatar>
              <q-icon name='sym_o_check' />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-separator v-if='extraOptionsHidden' />
    <q-btn
      v-if='extraOptionsHidden'
      @click='nextStatus'
      :color='jobCardStatusColor(props.jobCard.status)'
      icon='sym_o_navigate_next'
      padding='xs'
      size='13px'
      outline
    />
  </q-btn-group>
  <q-btn
    v-if='extraOptionsHidden'
    @click='changeStatus(JobCardStatusesEnum.COMPLETED)'
    icon='sym_o_check'
    color='positive'
    padding='xs'
    class='q-ml-sm'
    size='13px'
    outline
  >
    <q-tooltip>{{ $t('job_cards.complete_job_card') }}</q-tooltip>
  </q-btn>
</template>
