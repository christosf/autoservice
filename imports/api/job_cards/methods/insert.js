import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { JobCards } from '../../database'
import { JobCardsQueue } from '../collection'
import { CounterNamesEnum } from '../../counters/enums'
import { increaseCounter } from '../../counters/methods'
import { checkLoggedIn } from '../../users/utilities'

const insertJobCard = createMethod({
  name: 'job_cards:insert',

  schema: new SimpleSchema({
    jobCard: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run(params) {
    const { jobCard } = params

    const task = JobCardsQueue.add(async() => {
      jobCard.code = `JC${await increaseCounter({ name: CounterNamesEnum.JOB_CARDS })}`

      return { _id: await JobCards.insertAsync(jobCard), code: jobCard.code }
    })

    return task.promise
  }
})

export default insertJobCard
