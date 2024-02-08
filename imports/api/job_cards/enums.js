const JobCardStatusesEnum = {
  OPEN: 'open',
  ONGOING: 'ongoing',
  AWAITING_PARTS: 'awaiting parts',
  AWAITING_REVIEW: 'awaiting review',
  COMPLETED: 'completed',
  CANCELED: 'canceled'
}

const JobCardPrioritiesEnum = {
  NONE: 0,
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4
}

Object.freeze(JobCardStatusesEnum)
Object.freeze(JobCardPrioritiesEnum)

export { JobCardStatusesEnum, JobCardPrioritiesEnum }
