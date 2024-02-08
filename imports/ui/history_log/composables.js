import { HistoryLogTypesEnum } from '../../api/history_log/enums'
import { getHistoryLogQuery } from '../../api/history_log/queries'

export function useHistoryLogAPI() {
  return {
    // Enums
    HistoryLogTypesEnum,
    // Queries
    getHistoryLogQuery
  }
}
