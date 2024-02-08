import { JobCards } from '../../database'

import addInsertToHistoryLog from './add_insert_to_history_log'
import addUpdateToHistoryLog from './add_update_to_history_log'

JobCards.after.insert(addInsertToHistoryLog)
JobCards.after.update(addUpdateToHistoryLog)
