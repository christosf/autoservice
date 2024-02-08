import SimpleSchema from 'simpl-schema'
import { JobCardStatusesEnum, JobCardPrioritiesEnum } from './enums'

const jobCardSchema = new SimpleSchema({
  status: {
    type: String,
    allowedValues: Object.values(JobCardStatusesEnum),
    defaultValue: JobCardStatusesEnum.OPEN
  },
  priority: {
    type: Number,
    allowedValues: Object.values(JobCardPrioritiesEnum),
    defaultValue: JobCardPrioritiesEnum.NONE
  },
  vehicleId: {
    type: String
  },
  vehicleCache: {
    type: Object,
    blackbox: true,
    optional: true
  },
  ownerId: String,
  ownerCache: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // @ts-ignore
  dates: Object,
  'dates.startDate': {
    type: String,
    optional: true,
    min: 10,
    max: 10
  },
  'dates.startTime': {
    type: String,
    optional: true,
    min: 5,
    max: 5
  },
  'dates.dueDate': {
    type: String,
    optional: true,
    min: 10,
    max: 10
  },
  'dates.dueTime': {
    type: String,
    optional: true,
    min: 5,
    max: 5
  },
  startDate: {
    type: Date,
    optional: true,
    autoValue() {
      const dates = this.field('dates')
      const date = dates.value ? dates.value.startDate : null
      const time = dates.value ? dates.value.startTime : null

      if (date && time) {
        return new Date(
          parseInt(date.slice(6, 10), 10),
          parseInt(date.slice(3, 5), 10),
          parseInt(date.slice(0, 2), 10),
          parseInt(time.slice(0, 2), 10),
          parseInt(time.slice(3, 5), 10)
        )
      }

      if (date && !time) {
        return new Date(
          parseInt(date.slice(6, 10), 10),
          parseInt(date.slice(3, 5), 10),
          parseInt(date.slice(0, 2), 10)
        )
      }

      return this.unset()
    }
  },
  dueDate: {
    type: Date,
    optional: true,
    autoValue() {
      const dates = this.field('dates')
      const date = dates.value ? dates.value.dueDate : null
      const time = dates.value ? dates.value.dueTime : null

      if (date && time) {
        return new Date(
          parseInt(date.slice(6, 10), 10),
          parseInt(date.slice(3, 5), 10),
          parseInt(date.slice(0, 2), 10),
          parseInt(time.slice(0, 2), 10),
          parseInt(time.slice(3, 5), 10)
        )
      }

      if (date && !time) {
        return new Date(
          parseInt(date.slice(6, 10), 10),
          parseInt(date.slice(3, 5), 10),
          parseInt(date.slice(0, 2), 10)
        )
      }

      return this.unset()
    }
  },
  completedAt: {
    type: Date,
    optional() {
      // @ts-ignore
      return this.field('status').value !== JobCardStatusesEnum.COMPLETED
    }
  },
  vehicleMileage: {
    type: Number,
    optional() {
      // @ts-ignore
      return this.field('status').value !== JobCardStatusesEnum.COMPLETED
    }
  },
  assignedTo: {
    type: Array
  },
  'assignedTo.$': {
    type: String
  },
  customerRemarks: {
    type: String,
    optional: true
  },
  notes: {
    type: String,
    optional: true
  }
})

export default jobCardSchema
