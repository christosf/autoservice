<script setup>
import { useI18n } from 'vue-i18n'
import { useJobCardAPI, useJobCardFunctions } from '../composables'
import { useCoreFunctions } from '../../core/composables'

const props = defineProps({
  jobCard: {
    type: Object,
    required: true
  }
})

const { t: $t } = useI18n()
const { updatePriority, JobCardPrioritiesEnum } = useJobCardAPI()
const { jobCardPriorityLabel, jobCardPriorityColor } = useJobCardFunctions()
const { notifySuccess } = useCoreFunctions()
const jobCardPriorityKeys = Object.keys(JobCardPrioritiesEnum)

const priorityIsSelected = (priority) => priority === props.jobCard.priority

const changePriority = async(priority) => {
  if (priority === props.jobCard.priority) {
    return
  }

  try {
    await updatePriority({ jobCardId: props.jobCard._id, priority })
    notifySuccess($t('job_cards.msg_priority_updated'))
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <q-btn
    :label='jobCardPriorityLabel(props.jobCard.priority)'
    :color='jobCardPriorityColor(props.jobCard.priority)'
    icon='flag'
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
      <q-list style='min-width: 180px;' separator>
        <q-item class='bg-grey-1' dense>
          <q-item-section>
            <q-item-label class='text-caption text-bold'>{{ $t('job_cards.priority') }}</q-item-label>
          </q-item-section>
        </q-item>
        <template v-for='(key) in jobCardPriorityKeys' :key='key'>
          <q-item
            @click='changePriority(JobCardPrioritiesEnum[key])'
            class='q-px-xs'
            clickable
          >
            <q-item-section avatar>
              <q-icon
                :color='jobCardPriorityColor(JobCardPrioritiesEnum[key])'
                name='flag'
              />
            </q-item-section>
            <q-item-section>
              <q-item-label :class='{"text-bold": priorityIsSelected(JobCardPrioritiesEnum[key])}'>
                {{ $t(`job_cards.priority_${key.toLowerCase()}`) }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if='priorityIsSelected(JobCardPrioritiesEnum[key])' avatar>
              <q-icon name='sym_o_check' />
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>
