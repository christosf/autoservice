import { HistoryLogTypesEnum } from '../../api/history-log/enums'
import { getHistoryLog } from '../../api/history-log/queries'

export function useHistoryLogAPI() {

    return {
        HistoryLogTypesEnum,
        getHistoryLog
    }
}
