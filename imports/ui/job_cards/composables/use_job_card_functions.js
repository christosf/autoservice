import { useI18n } from 'vue-i18n'
import { useJobCardAPI } from './index'

export default function useJobCardFunctions() {
  const { t: $t } = useI18n()
  const { JobCardStatusesEnum, JobCardPrioritiesEnum } = useJobCardAPI()

  const jobCardStatusLabel = (status) => {
    switch (status) {
      case JobCardStatusesEnum.OPEN: return $t('job_cards.status_open')
      case JobCardStatusesEnum.ONGOING: return $t('job_cards.status_ongoing')
      case JobCardStatusesEnum.AWAITING_PARTS: return $t('job_cards.status_awaiting_parts')
      case JobCardStatusesEnum.AWAITING_REVIEW: return $t('job_cards.status_awaiting_review')
      case JobCardStatusesEnum.COMPLETED: return $t('job_cards.status_completed')
      case JobCardStatusesEnum.CANCELED: return $t('job_cards.status_canceled')
      default: return $t('job_cards.status')
    }
  }

  const jobCardStatusColor = (status) => {
    switch (status) {
      case JobCardStatusesEnum.OPEN: return 'secondary'
      case JobCardStatusesEnum.ONGOING: return 'blue'
      case JobCardStatusesEnum.AWAITING_PARTS: return 'deep-orange'
      case JobCardStatusesEnum.AWAITING_REVIEW: return 'deep-purple'
      case JobCardStatusesEnum.COMPLETED: return 'positive'
      case JobCardStatusesEnum.CANCELED: return 'negative'
      default: return 'grey'
    }
  }

  const jobCardPriorityLabel = (priority) => {
    switch (priority) {
      case JobCardPrioritiesEnum.NONE: return $t('job_cards.priority_none')
      case JobCardPrioritiesEnum.LOW: return $t('job_cards.priority_low')
      case JobCardPrioritiesEnum.NORMAL: return $t('job_cards.priority_normal')
      case JobCardPrioritiesEnum.HIGH: return $t('job_cards.priority_high')
      case JobCardPrioritiesEnum.URGENT: return $t('job_cards.priority_urgent')
      default: return $t('job_cards.priority')
    }
  }

  const jobCardPriorityColor = (priority) => {
    switch (priority) {
      case JobCardPrioritiesEnum.LOW: return 'light-green'
      case JobCardPrioritiesEnum.NORMAL: return 'blue'
      case JobCardPrioritiesEnum.HIGH: return 'deep-orange'
      case JobCardPrioritiesEnum.URGENT: return 'red-10'
      default: return 'grey'
    }
  }

  return {
    jobCardStatusLabel,
    jobCardStatusColor,
    jobCardPriorityLabel,
    jobCardPriorityColor
  }
}
