<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from '../../quasar'
import { useHistoryLogAPI } from '../composables'
import { useContactAPI } from '../../contacts/composables'
// import { useVehicleAPI } from '../../vehicles/composables'

const props = defineProps({
  id: String,
  type: String
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { formatDate } = date

const { HistoryLogTypesEnum, getHistoryLogQuery } = useHistoryLogAPI()
const { getContactBasicDetails } = useContactAPI()
// const { getVehicleBasicDetails } = useVehicleAPI()

const vueDependency = new Tracker.Dependency()
const getHistoryLog = getHistoryLogQuery.clone()
const loading = ref(false)
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

const historyLogIcon = (logType) => {
  switch (logType) {
    case HistoryLogTypesEnum.INSERT: return 'person_add'
    case HistoryLogTypesEnum.UPDATE: return 'update'
    case HistoryLogTypesEnum.NOTES_UPDATE: return 'notes'
    case HistoryLogTypesEnum.ACTIVATION: return 'visibility'
    case HistoryLogTypesEnum.DEACTIVATION: return 'visibility_off'
    case HistoryLogTypesEnum.LINK: return 'link'
    case HistoryLogTypesEnum.UNLINK: return 'link_off'
    case HistoryLogTypesEnum.UNLINK_DELETE: return 'link_off'
    default: return ''
  }
}

const historyLogTypeLabel = (type) => {
  switch (type) {
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

const operationTypeLabel = (operation) => {
  switch (operation) {
    case 'add': return $t('history_log.operation_add')
    case 'replace': return $t('history_log.operation_replace')
    case 'remove': return $t('history_log.operation_remove')
    default: return ''
  }
}

const showExpandBtn = (logItem) => {
  const { type: logType, metadata } = logItem
  const types = [HistoryLogTypesEnum.ACTIVATION, HistoryLogTypesEnum.DEACTIVATION]

  return !!metadata && !!metadata.changeList && !types.includes(logType)
}

const showChangeListLength = (logItem) => {
  const { type: logType, metadata } = logItem
  const types = [HistoryLogTypesEnum.INSERT, HistoryLogTypesEnum.UPDATE]

  return !!metadata && !!metadata.changeList && types.includes(logType)
}

const getFieldName = (path) => {
  if (props.type === 'contact') {
    if (path[0] === 'contactMethods' && path.length > 1) {
      if (path.length === 3) {
        switch (path[2]) {
          case 'type': return $t('history_log.contacts_method_type', { index: path[1] + 2 })
          case 'description': return $t('history_log.contacts_method_description', { index: path[1] + 2 })
          case 'value': return $t('history_log.contacts_method_value', { index: path[1] + 2 })
          default: return $t('history_log.contacts_method', { index: path[1] + 2 })
        }
      }
      return $t('history_log.contacts_method', { index: path[1] + 2 })
    }

    if (path[0] === 'tags' && path.length === 2) {
      return $t('history_log.tag', { index: path[1] + 1 })
    }

    if (path.length === 2) {
      return $t(`history_log.contacts_${path[0]}_${path[1]}`)
    }
    return $t(`history_log.${path[0]}`)
  }

  if (props.type === 'vehicle') {
    if (path[0] === 'tags' && path.length === 2) {
      return $t('history_log.vehicles_tag', { index: path[1] + 1 })
    }

    return $t(`history_log.vehicles_${path[0]}`)
  }

  return path
}

const getLinkDetails = (metadata) => {
  const { linkType } = metadata

  if (linkType === 'vehicle') {
    return metadata.vehicle.regNumber
      ? `${metadata.vehicle.regNumber} - ${metadata.vehicle.makeModel}`
      : `${metadata.vehicle.makeModel} (${metadata.vehicle.code})`
  }

  return metadata.type
}

const getLinkUrl = (metadata) => {
  const { linkType } = metadata

  if (linkType === 'vehicle') {
    return { name: 'ViewVehicle', params: { code: metadata.vehicle.code } }
  }

  return null
}

const getOldValue = (change) => {
  const { oldValue, path } = change

  if (props.type === 'contact') {
    if (path.includes('type')) {
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

  if (props.type === 'vehicle') {
    if (path[0] === 'ownerId') {
      return change.oldDeleted ? $t('history_log.deleted') : `${change.oldName} - ${change.oldCode}`
    }
  }

  return oldValue
}

const oldValueHasUrl = (change) => {
  if (props.type === 'vehicle' && change.path[0] === 'ownerId' && !change.oldDeleted) {
    return true
  }
  return false
}

const getOldValueUrl = (change) => {
  if (props.type === 'vehicle' && change.path[0] === 'ownerId' && !change.oldDeleted) {
    return { name: 'ViewContact', params: { code: change.oldCode } }
  }
  return null
}

const valueHasUrl = (change) => {
  if (props.type === 'vehicle' && change.path[0] === 'ownerId' && !change.deleted) {
    return true
  }
  return false
}

const getValueUrl = (change) => {
  if (props.type === 'vehicle' && change.path[0] === 'ownerId' && !change.deleted) {
    return { name: 'ViewContact', params: { code: change.code } }
  }

  return null
}

const getValue = (change) => {
  const { value, path } = change

  if (props.type === 'contact') {
    if (path.includes('type')) {
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

  if (props.type === 'vehicle') {
    if (path[0] === 'ownerId') {
      return change.deleted ? $t('history_log.deleted') : `${change.name} - ${change.code}`
    }
  }

  return value
}

const getAdditionalInfo = () => {
  historyLog.value.forEach((log) => {
    if (log.metadata && log.metadata.linkType === 'vehicle') {
      getVehicleBasicDetails({ vehicleId: log.metadata.vehicle._id }).then((response) => {
        if (response) {
          const { makeModel, regNumber } = response
          log.metadata.vehicle.makeModel = makeModel
          log.metadata.vehicle.regNumber = regNumber
        } else {
          log.metadata.vehicle.deleted = true
        }
      })
    }

    if (props.type === 'vehicle' && log.metadata && log.metadata.changeList) {
      log.metadata.changeList.forEach((item) => {
        if (item.path.includes('ownerId')) {
          if (item.value) {
            getContactBasicDetails({ contactId: item.value }).then((response) => {
              if (response) {
                const { name, code } = response
                item.name = name
                item.code = code
              } else {
                item.deleted = true
              }
            })
          }
          if (item.oldValue) {
            getContactBasicDetails({ contactId: item.oldValue }).then((response) => {
              if (response) {
                const { name, code } = response
                item.oldName = name
                item.oldCode = code
              } else {
                item.oldDeleted = true
              }
            })
          }
        }
      })
    }
  })
}

const updateHistoryLog = (scope) => {
  pagination.value = scope.pagination
  getHistoryLog.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  loading.value = true

  getHistoryLog.setParams({
    id: props.id,
    type: props.type,
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

    // getAdditionalInfo()

    loading.value = false
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
    :loading='loading'
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
          <q-icon :name='historyLogIcon(props.row.type)' color='secondary' size='22px' />
        </q-td>
        <q-td>
          <div>
            <span>{{ historyLogTypeLabel(props.row.type) }}</span>
            <span v-if='showChangeListLength(props.row)'>
              ({{ props.row.metadata.changeList.length }})
            </span>
          </div>
          <div v-if='props.row.metadata && props.row.metadata.linkType' class='text-caption'>
            <span v-if='props.row.metadata[props.row.metadata.linkType].deleted'>
              {{ getLinkDetails(props.row.metadata) }}
            </span>
            <router-link v-else :to='getLinkUrl(props.row.metadata)' class='text-secondary'>
              {{ getLinkDetails(props.row.metadata) }}
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
            v-if='showExpandBtn(props.row)'
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
              <q-card-section class='q-pa-sm text-bold'>
                <span :class='{
                  "text-negative": change.op === "remove",
                  "text-deep-orange": change.op === "replace",
                  "text-positive": change.op === "add"
                }'>
                  ({{ operationTypeLabel(change.op) }})
                </span>
                <span>{{ getFieldName(change.path) }}</span>
              </q-card-section>
              <q-separator />
              <div class='row'>
                <div v-if='change.op === "add"' class='col-12'>
                  <div class='q-pa-sm'>
                    <router-link v-if='valueHasUrl(change)' :to='getValueUrl(change)' class='text-secondary'>
                      {{ getValue(change) }}
                    </router-link>
                    <span v-else v-html='getValue(change)' />
                  </div>
                </div>
                <div v-if='change.op === "remove"' class='col-12'>
                  <div class='q-pa-sm'>
                    <router-link
                      v-if='oldValueHasUrl(change)'
                      :to='getOldValueUrl(change)'
                      class='text-secondary'
                    >
                      {{ getOldValue(change) }}
                    </router-link>
                    <span v-else v-html='getOldValue(change)' />
                  </div>
                </div>
                <template v-if='change.op === "replace"'>
                  <div class='col-xs-12 col-sm-6'>
                    <div class='q-pa-sm'>
                      <div class='text-bold'>{{ $t('history_log.value_prev') }}:</div>
                      <router-link
                        v-if='oldValueHasUrl(change)'
                        :to='getOldValueUrl(change)'
                        class='text-secondary'
                      >
                        {{ getOldValue(change) }}
                      </router-link>
                      <span v-else v-html='getOldValue(change)' />
                    </div>
                  </div>
                  <div class='col-xs-12 col-sm-6'>
                    <div class='q-pa-sm'>
                      <div class='text-bold'>{{ $t('history_log.value_new') }}:</div>
                      <router-link
                        v-if='valueHasUrl(change)'
                        :to='getValueUrl(change)'
                        class='text-secondary'
                      >
                        {{ getValue(change) }}
                      </router-link>
                      <span v-else v-html='getValue(change)' />
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
