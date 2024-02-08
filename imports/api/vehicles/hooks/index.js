import { Vehicles } from '../../database'

import addInsertToHistoryLog from './add_insert_to_history_log'
import addUpdateToHistoryLog from './add_update_to_history_log'
import updateOwnerVehicleCount from './update_owner_vehicle_count'
import updateOwnerHistoryLogAfterInsert from './update_owner_history_log_after_insert'
import updateOwnerHistoryLogAfterUpdate from './update_owner_history_log_after_update'
import updateOwnerHistoryLogAfterRemove from './update_owner_history_log_after_remove'

Vehicles.after.insert(updateOwnerVehicleCount)
Vehicles.after.insert(addInsertToHistoryLog)
Vehicles.after.insert(updateOwnerHistoryLogAfterInsert)

Vehicles.after.update(updateOwnerVehicleCount)
Vehicles.after.update(addUpdateToHistoryLog)
Vehicles.after.update(updateOwnerHistoryLogAfterUpdate)

Vehicles.after.remove(updateOwnerVehicleCount)
Vehicles.after.remove(updateOwnerHistoryLogAfterRemove)
