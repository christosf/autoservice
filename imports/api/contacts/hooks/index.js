import { Contacts } from '../../database'

import addInsertToHistoryLog from './add_insert_to_history_log'
import addUpdateToHistoryLog from './add_update_to_history_log'

Contacts.after.insert(addInsertToHistoryLog)
Contacts.after.update(addUpdateToHistoryLog)
