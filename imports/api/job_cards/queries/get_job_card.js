import SimpleSchema from 'simpl-schema'
import { JobCards } from '../../database'

const schema = new SimpleSchema({
  jobCardId: {
    type: String,
    optional() {
      // @ts-ignore
      return this.field('code').isSet
    }
  },
  code: {
    type: String,
    optional() {
      // @ts-ignore
      return this.field('jobCardId').isSet
    }
  }
})

const getJobCardQuery = JobCards.createQuery('job_cards:get_job_card', {
  $filter({ filters, params }) {
    if (params.jobCardId) {
      filters._id = params.jobCardId
    }
    if (params.code) {
      filters.code = params.code.toUpperCase()
    }
  },
  _id: 1,
  code: 1,
  status: 1,
  priority: 1,
  assignedTo: 1,
  dates: 1,
  startDate: 1,
  dueDate: 1,
  tags: 1,
  customerRemarks: 1,
  vehicle: {
    _id: 1,
    code: 1,
    regNumber: 1,
    makeModel: 1
  },
  owner: {
    _id: 1,
    code: 1,
    name: 1,
    phoneNumber: 1
  },
  notes: 1
}, {
  validateParams: (params) => schema.validate(schema.clean(params))
})

export default getJobCardQuery
