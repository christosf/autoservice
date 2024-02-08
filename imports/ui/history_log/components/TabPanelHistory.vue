<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from '../../quasar'
import { useHistoryLogAPI } from '../composables'
import { useCoreAPI } from '../../core/composables'
import { useVehicleAPI } from '../../vehicles/composables'

const { getHistoryLogQuery, HistoryLogTypesEnum } = useHistoryLogAPI()
const { convertCamelToSnakeCase } = useCoreAPI()
const { getVehicleBasicDetails } = useVehicleAPI()

const props = defineProps({
  objectId: {
    type: String,
    required: true
  },
  objectType: {
    type: String,
    required: true
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { formatDate } = date

const vueDependency = new Tracker.Dependency()
const getHistoryLog = getHistoryLogQuery.clone()
const isLoading = ref(false)
const historyLog = ref([])

const pagination = ref({
  sortBy: 'createdAt',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  {
    name: 'type',
    field: 'type',
    align: 'center'
  },
  {
    name: 'action',
    field: 'type',
    label: 'core.action',
    align: 'left'
  },
  {
    name: 'createdAt',
    field: 'createdAt',
    label: 'core.date',
    sortable: true,
    align: 'left'
  },
  {
    name: 'createdBy',
    field: 'createdBy',
    label: 'core.executed_by',
    align: 'left'
  },
  {
    name: 'operations',
    classes: 'operations',
    align: 'right'
  }
]

const historyLogIcon = ({ logType }) => {
  switch (logType) {
    case HistoryLogTypesEnum.INSERT: return 'sym_o_add_box'
    case HistoryLogTypesEnum.UPDATE: return 'sym_o_update'
    case HistoryLogTypesEnum.NOTES_UPDATE: return 'sym_o_notes'
    case HistoryLogTypesEnum.ACTIVATION: return 'sym_o_visibility'
    case HistoryLogTypesEnum.DEACTIVATION: return 'sym_o_visibility_off'
    case HistoryLogTypesEnum.LINK: return 'sym_o_link'
    case HistoryLogTypesEnum.UNLINK: return 'sym_o_link_off'
    case HistoryLogTypesEnum.UNLINK_DELETE: return 'sym_o_link_off'
    default: return ''
  }
}

const historyLogTypeLabel = ({ logType }) => {
  switch (logType) {
    case 'insert': return $t('history_log.type_insert')
    case 'update': return $t('history_log.type_update')
    case 'activation': return $t('history_log.type_activation')
    case 'deactivation': return $t('history_log.type_deactivation')
    case 'notes_update': return $t('history_log.type_notes_update')
    case 'link': return $t('history_log.type_link')
    case 'unlink': return $t('history_log.type_unlink')
    case 'unlink_delete': return $t('history_log.type_unlink_delete')
    default: return ''
  }
}

const operationTypeLabel = ({ operation }) => {
  switch (operation) {
    case 'add': return $t('history_log.operation_add')
    case 'replace': return $t('history_log.operation_replace')
    case 'reorder': return $t('history_log.operation_reorder')
    case 'remove': return $t('history_log.operation_remove')
    default: return ''
  }
}

const showChangeListLength = ({ logItem }) => {
  const { type: logType, metadata } = logItem
  const types = [HistoryLogTypesEnum.INSERT, HistoryLogTypesEnum.UPDATE]

  return !!metadata && !!metadata.changeList && types.includes(logType)
}

const showExpandBtn = ({ logItem }) => {
  const { type: logType, metadata } = logItem
  const types = [HistoryLogTypesEnum.ACTIVATION, HistoryLogTypesEnum.DEACTIVATION]

  return !!metadata && !!metadata.changeList && !types.includes(logType)
}

const fieldNameLabel = ({ operation, path }) => {
  switch (path[0]) {
    case 'type': return $t('core.type')
    case 'tags': return $t('core.tags')
    case 'billingAddress': return $t('core.address_billing')
    case 'deliveryAddress': return $t('core.address_delivery')
    case 'ownerId': return $t('vehicles.owner')
    default: break
  }

  if (props.objectType === 'contacts' && path[0] === 'contactMethods' && path.length > 1) {
    if (path.length === 3 && operation !== 'reorder') {
      switch (path[2]) {
        case 'type': return $t('history_log.contacts_method_type', { index: path[1] + 2 })
        case 'description': return $t('history_log.contacts_method_description', { index: path[1] + 2 })
        case 'value': return $t('history_log.contacts_method_value', { index: path[1] + 2 })
        default: return $t('history_log.contacts_method', { index: path[1] + 2 })
      }
    }
    return $t('history_log.contacts_method', { index: path[1] + 2 })
  }

  return $t(`${props.objectType}.${convertCamelToSnakeCase({ value: path[0] })}`)
}

const oldValueLabel = ({ oldValue, path }) => {
  if (props.objectType === 'contacts') {
    if (path[0] === 'type') {
      return $t(`contacts.${oldValue}`)
    }

    if (path.length === 1 && (path[0] === 'deliveryAddress' || path[0] === 'billingAddress')) {
      return Object.values(oldValue).join(', ')
    }

    if (path.length === 2 && path[0] === 'contactMethods') {
      let output = `${$t(`contacts.${oldValue.type}`)}: ${oldValue.value}`

      if (oldValue.description) {
        output += ` | ${$t('core.description')}: ${oldValue.description}`
      }

      return output
    }
  }

  return oldValue
}

const valueLabel = (change) => {
  const { value, path } = change

  if (props.objectType === 'contacts') {
    if (path[0] === 'type') {
      return $t(`contacts.${value}`)
    }

    if (path.length === 1 && (path[0] === 'deliveryAddress' || path[0] === 'billingAddress')) {
      return Object.values(value).join(', ')
    }

    if (path.length === 2 && path[0] === 'contactMethods') {
      let output = `${$t(`contacts.${value.type}`)}: ${value.value}`

      if (value.description) {
        output += ` | ${$t('core.description')}: ${value.description}`
      }

      return output
    }
  }

  if (props.objectType === 'vehicles') {
    if (path[0] === 'ownerId') {
      console.log(change)
    }
  }

  return value
}

const computeReorders = () => {
  historyLog.value.forEach((log) => {
    if (!log.metadata) {
      return
    }

    const { changeList } = log.metadata
    const indexesToDelete = []

    if (!changeList) {
      return
    }

    changeList.forEach((change, index) => {
      const { op, path, value, oldValue } = change

      if (op === 'replace' && path.length === 3 && path[0] === 'contactMethods') {
        changeList.forEach((change2, index2) => {
          if (index !== index2) {
            const { path: path2, value: value2, oldValue: oldValue2 } = change2

            if (value === oldValue2 && oldValue === value2) {
              if (path[2] === 'value') {
                changeList.push({
                  op: 'reorder',
                  path,
                  value,
                  fromIndex: path2[1],
                  toIndex: path[1],
                  changeIndex: index
                })
              }

              indexesToDelete.push(index)
              indexesToDelete.push(index2)
            }
          }
        })
      }
    })

    const uniqueIndexes = indexesToDelete
      .sort((a, b) => a - b)
      .reverse()
      .filter((item, pos, ary) => !pos || item !== ary[pos - 1])

    uniqueIndexes.forEach((indexToRemove) => {
      log.metadata.changeList.splice(indexToRemove, 1)
    })
  })
}

const linkDetails = (metadata) => {
  const { linkType } = metadata

  if (linkType === 'vehicle') {
    return metadata.vehicle.regNumber
      ? `${metadata.vehicle.regNumber} - ${metadata.vehicle.makeModel} (${metadata.vehicle.code})`
      : `${metadata.vehicle.makeModel} (${metadata.vehicle.code})`
  }

  return metadata.type
}

const linkUrl = (metadata) => {
  const { linkType } = metadata

  if (linkType === 'vehicle') {
    return { name: 'ViewVehicle', params: { code: metadata.vehicle.code } }
  }

  return null
}

const getLinkData = () => {
  historyLog.value.forEach(async(log) => {
    if (log.type === HistoryLogTypesEnum.LINK || log.type === HistoryLogTypesEnum.UNLINK) {
      if (log.metadata && log.metadata.linkType === 'vehicle') {
        const vehicle = await getVehicleBasicDetails({ vehicleId: log.metadata.vehicle._id })

        if (vehicle) {
          log.metadata.vehicle.regNumber = vehicle.regNumber
          log.metadata.vehicle.makeModel = vehicle.makeModel
        }
      }
    }
  })
}

const updateHistoryLog = (scope) => {
  pagination.value = scope.pagination
  getHistoryLog.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(async() => {
  vueDependency.depend()
  isLoading.value = true

  getHistoryLog.setParams({
    objectId: props.objectId,
    objectType: props.objectType,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    limit: pagination.value.rowsPerPage,
    skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
  })

  const subscription = getHistoryLog.subscribe()
  const countSubscription = getHistoryLog.subscribeCount()

  if (subscription.ready() && countSubscription.ready()) {
    historyLog.value = getHistoryLog.fetch()
    pagination.value.rowsNumber = getHistoryLog.getCount()

    computeReorders()
    await getLinkData()

    isLoading.value = false
  }
})

onUnmounted(() => {
  getHistoryLog.unsubscribeCount()
  tracker.stop()
})
</script>

<template>
  <q-table
    v-model:pagination='pagination'
    @request='updateHistoryLog'
    @touchstart.stop
    @mousedown.stop
    :rows='historyLog'
    :columns='columns'
    :loading='isLoading'
    :rows-per-page-options='[10,20,30,50]'
    row-key='_id'
    id='history-log-table'
    binary-state-sort
    bordered
    flat
  >
    <template #header-cell='props'>
      <q-th :props='props' :class='props.col.classes'>
        {{ props.col.label ? $t(props.col.label) : '' }}
      </q-th>
    </template>
    <template #body='props'>
      <q-tr :props='props'>
        <q-td :class='{"dense": $q.screen.lt.sm}' auto-width>
          <q-icon :name='historyLogIcon({ logType: props.row.type })' color='secondary' size='22px' />
        </q-td>
        <q-td>
          <div>
            <span>{{ historyLogTypeLabel({ logType: props.row.type }) }}</span>
            <span v-if='showChangeListLength({ logItem: props.row })'>
              ({{ props.row.metadata.changeList.length }})
            </span>
          </div>
          <div v-if='props.row.metadata && props.row.metadata.linkType' class='text-caption text-grey'>
            <div v-if='props.row.type === HistoryLogTypesEnum.UNLINK_DELETE'>
              {{ linkDetails(props.row.metadata) }}
            </div>
            <router-link v-else :to='linkUrl(props.row.metadata)' class='text-secondary'>
              {{ linkDetails(props.row.metadata) }}
            </router-link>
          </div>
        </q-td>
        <q-td>{{ formatDate(props.row.createdAt, 'DD.MM.YYYY - HH:mm') }}</q-td>
        <q-td>
          <router-link
            :to='{ name: "ViewUser", params: { username: props.row.createdBy.username }}'
            class='text-secondary'
          >
            {{ props.row.createdBy.username }}
          </router-link>
        </q-td>
        <q-td class='operations' auto-width>
          <q-btn
            v-if='showExpandBtn({ logItem: props.row })'
            @click='props.expand = !props.expand'
            :icon='props.expand ? "close" : "fact_check"'
            color='primary'
            size='sm'
            outline
            dense
          >
            <q-tooltip v-if='!props.expand' anchor='top middle' self='bottom middle'>
              {{ $t("history_log.view_change_list") }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-if='props.expand' :props='props' class='history-log-change-list'>
        <q-td colspan='5' class='bg-grey-2'>
          <div v-if='props.row.metadata && props.row.metadata.changeList' class='q-gutter-xs'>
            <q-card
              v-for='(change, index) in props.row.metadata.changeList'
              :key='index'
              class='bg-white'
              bordered
              square
              flat
            >
              <q-card-section class='q-pa-sm text-bold border-bottom'>
                <span :class='{
                  "text-negative": change.op === "remove",
                  "text-deep-orange": change.op === "replace" || change.op === "reorder",
                  "text-positive": change.op === "add"
                }'>
                  ({{ operationTypeLabel({ operation: change.op }) }})
                </span>
                <span>{{ fieldNameLabel({ operation: change.op, path: change.path }) }}</span>
              </q-card-section>
              <div class='row'>
                <div v-if='change.op === "add"' class='col-12'>
                  <div class='q-pa-sm'>
                    {{ valueLabel(change) }}
                  </div>
                </div>
                <div v-if='change.op === "remove"' class='col-12'>
                  <div class='q-pa-sm'>
                    {{ oldValueLabel(change) }}
                  </div>
                </div>
                <div v-if='change.op === "reorder"' class='col-12'>
                  <div class='q-pa-sm'>
                    <span class='font-weight-medium'>{{ change.value }}: </span>
                    <span class='text-caption text-italic'>
                      {{ $t('history_log.msg_reorder', {
                        from: change.fromIndex + 2,
                        to: change.toIndex + 2
                      }) }}
                    </span>
                  </div>
                </div>
                <template v-if='change.op === "replace"'>
                  <div class='col-xs-12 col-sm-6'>
                    <div class='q-pa-sm'>
                      <div class='text-bold'>{{ $t('history_log.value_prev') }}:</div>
                      {{ oldValueLabel(change) }}
                    </div>
                  </div>
                  <div class='col-xs-12 col-sm-6'>
                    <div class='q-pa-sm'>
                      <div class='text-bold'>{{ $t('history_log.value_new') }}:</div>
                      {{ valueLabel(change) }}
                    </div>
                  </div>
                </template>
              </div>
            </q-card>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style scoped>
#history-log-table tr.history-log-change-list > td {
  font-size: 12px;
  padding: 10px;
}
</style>
