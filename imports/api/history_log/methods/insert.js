import SimpleSchema from 'simpl-schema'
import { createMethod } from 'meteor/jam:method'
import { HistoryLog } from '../../database'
import { HistoryLogQueue } from '../collection'
import { checkLoggedIn } from '../../users/utilities'

const insertHistoryLog = createMethod({
  name: 'history_log:insert',

  schema: new SimpleSchema({
    log: {
      type: Object,
      blackbox: true
    }
  }),

  before: [checkLoggedIn],

  async run({ log }) {
    return (HistoryLogQueue.add(() => HistoryLog.insertAsync(log))).promise
  }
})

export default insertHistoryLog
