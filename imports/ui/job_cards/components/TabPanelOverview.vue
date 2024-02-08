<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useJobCardAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'
import JobCardStatusWidget from './JobCardStatusWidget.vue'
import JobCardPriorityWidget from './JobCardPriorityWidget.vue'
import CustomerRemarksCard from './CustomerRemarksCard.vue'
import InternalNotesCard from '../../core/components/InternalNotesCard.vue'

const props = defineProps({
  jobCard: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t: $t } = useI18n()
const { notifyError, notifySuccess, unsavedChangesDialog } = useCoreFunctions()
const { updateNotes } = useJobCardAPI()

const notesCardRef = ref(null)
const notesCardModel = ref('')
const isNotesCardSubmitted = ref(false)

const isNotesCardBtnDisabled = computed(() => (
  (notesCardModel.value && notesCardModel.value.trim() === props.jobCard.notes)
  || (notesCardModel.value === '' && !props.jobCard.notes)
))

const submitNotes = async() => {
  isNotesCardSubmitted.value = true

  // @ts-ignore
  const { updated } = await updateNotes({ jobCardId: props.jobCard._id, notes: notesCardModel.value })

  if (updated) {
    notifySuccess($t('core.msg_notes_update_successful'))
  } else {
    notifyError()
  }

  isNotesCardSubmitted.value = false
  notesCardRef.value.focus()
}

watchEffect(() => {
  notesCardModel.value = props.jobCard.notes ? props.jobCard.notes : ''
})

onBeforeRouteUpdate((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.jobCard.notes ? props.jobCard.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})

onBeforeRouteLeave((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.jobCard.notes ? props.jobCard.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})
</script>

<template>
  <div class='row q-col-gutter-sm'>
    <div class='col-xs-12 col-sm-12 col-md-8'>
      <div class='q-gutter-sm'>

        <q-card bordered flat>
          <q-card-section>
            list of parts & services
          </q-card-section>
        </q-card>

        <customer-remarks-card :job-card='jobCard' />

        <internal-notes-card
          v-model='notesCardModel'
          @submit='submitNotes'
          :disabled='isNotesCardBtnDisabled'
          :submitted='isNotesCardSubmitted'
          ref='notesCardRef'
        />

      </div>
    </div>
    <div class='col-xs-12 col-sm-12 col-md-4'>
      <div class='q-gutter-sm'>

        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm'>{{ $t('job_cards.status') }}</q-card-section>
          <q-card-section class='q-pt-none'>
            <div class='row q-gutter-sm'>
              <job-card-status-widget :job-card='jobCard' />
            </div>
          </q-card-section>
          <q-card-section class='text-h6 text-bold q-py-sm'>{{ $t('core.dates') }}</q-card-section>
          <q-card-section class='q-pt-none'>
            <div class='row q-gutter-sm'>
              {{ jobCard.dates }}
            </div>
          </q-card-section>
          <q-card-section class='text-h6 text-bold q-py-sm'>{{ $t('job_cards.priority') }}</q-card-section>
          <q-card-section class='q-pt-none'>
            <div class='row q-gutter-sm'>
              <job-card-priority-widget :job-card='jobCard' />
            </div>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm border-bottom'>
            {{ $t('core.tags') }}
          </q-card-section>
          <q-card-section v-if='props.jobCard.tags && props.jobCard.tags.length > 0' class='q-py-sm'>
            <q-chip v-for='tag in props.jobCard.tags' :key='tag' class='q-ma-none q-mr-sm' square>
              {{ tag }}
            </q-chip>
          </q-card-section>
          <q-card-section v-else class='text-caption text-grey q-py-sm'>
            {{ $t('core.none') }}
          </q-card-section>
        </q-card>

      </div>
    </div>
  </div>
</template>
