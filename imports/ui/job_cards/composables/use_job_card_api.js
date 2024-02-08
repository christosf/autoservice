import { JobCardStatusesEnum, JobCardPrioritiesEnum } from '../../../api/job_cards/enums'

import {
  insertJobCard,
  updateNotes,
  updateStatus,
  updatePriority
} from '../../../api/job_cards/methods'

import {
  getDistinctFieldValuesQuery,
  getJobCardQuery,
  getJobCardListQuery
} from '../../../api/job_cards/queries'

export default function useJobCardAPI() {
  const getDistinctFieldValues = (params) => getDistinctFieldValuesQuery.clone(params).fetchSync()

  return {
    // Enums
    JobCardStatusesEnum,
    JobCardPrioritiesEnum,
    // Queries
    getJobCardQuery,
    getJobCardListQuery,
    // Methods
    insertJobCard,
    updateNotes,
    updateStatus,
    updatePriority,
    // Getters
    getDistinctFieldValues
  }
}
