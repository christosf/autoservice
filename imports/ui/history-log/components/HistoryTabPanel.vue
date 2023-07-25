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
                        <span v-if='props.row.metadata && props.row.metadata.linkType'>
                            {{ $t(`history_log.type_${props.row.type}_${props.row.metadata.linkType}`) }}
                        </span>
                        <span v-else>{{ $t(`history_log.type_${props.row.type}`) }}</span>
                        <span v-if='isChangeListLengthVisible(props.row)'>
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
                        v-if='isExpandBtnVisible(props.row)'
                        @click='props.expand = !props.expand'
                        :icon='props.expand ? "close" : "fact_check"'
                        color='primary'
                        size='sm'
                        outline
                        dense
                    >
                        <q-tooltip v-if='!props.expand' anchor='top middle' self='bottom middle'>{{ $t("history_log.view_change_list") }}</q-tooltip>
                    </q-btn>
                </q-td>
            </q-tr>
            <q-tr v-if='props.expand' :props='props' class='history-log-change-list'>
                <q-td colspan='5' class='bg-grey-2'>
                    <div v-if='props.row.metadata && props.row.metadata.changeList' class='q-gutter-xs'>
                        <q-card v-for='change in props.row.metadata.changeList' class='bg-white' bordered square flat>
                            <q-card-section class='q-pa-sm text-bold'>           
                                <span :class='{
                                    "text-negative": change.op === "remove",
                                    "text-deep-orange": change.op === "replace",
                                    "text-positive": change.op === "add"
                                }'>
                                    ({{ $t(`history_log.op_${change.op}`) }})
                                </span>
                                <span>{{ getFieldName(change.path) }}</span>
                            </q-card-section>
                            <q-separator />
                            <div class='row'>
                                <div v-if='change.op === "add"' class='col-12'>
                                    <div class='q-pa-sm'>
                                        <router-link v-if='isValueUrl(change)' :to='getValueUrl(change)' class='text-secondary'>
                                            {{ getValue(change) }}
                                        </router-link>
                                        <span v-else v-html='getValue(change)' />
                                    </div>
                                </div>
                                <div v-if='change.op === "remove"' class='col-12'>
                                    <div class='q-pa-sm'>
                                        <router-link v-if='isOldValueUrl(change)' :to='getOldValueUrl(change)' class='text-secondary'>
                                            {{ getOldValue(change) }}
                                        </router-link>
                                        <span v-else v-html='getOldValue(change)' />
                                    </div>
                                </div>
                                <template v-if='change.op === "replace"'>
                                    <div class='col-xs-12 col-sm-6'>
                                        <div class='q-pa-sm'>
                                            <div class='text-bold'>{{ $t('history_log.value_prev') }}:</div>
                                            <router-link v-if='isOldValueUrl(change)' :to='getOldValueUrl(change)' class='text-secondary'>
                                                {{ getOldValue(change) }}
                                            </router-link>
                                            <span v-else v-html='getOldValue(change)' />
                                        </div>
                                    </div>
                                    <div class='col-xs-12 col-sm-6'>
                                        <div class='q-pa-sm'>
                                            <div class='text-bold'>{{ $t('history_log.value_new') }}:</div>
                                            <router-link v-if='isValueUrl(change)' :to='getValueUrl(change)' class='text-secondary'>
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

<script>
import { Tracker } from 'meteor/tracker'
import { ref, toRefs, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from '../../quasar'
import { useHistoryLogAPI } from '../composables'
import { useContactAPI } from '../../contacts/composables'
import { useVehicleAPI } from '../../vehicles/composables'

export default {
    props: {
        id: String,
        type: String
    },
    setup(props) {
        const { t: $t } = useI18n()
        const { id, type } = toRefs(props)
        const { formatDate } = date
        const { getBasicDetails: getContactBasicDetails } = useContactAPI()
        const { getBasicDetails: getVehicleBasicDetails } = useVehicleAPI()

        const {
            HistoryLogTypesEnum,
            getHistoryLog
        } = useHistoryLogAPI()

        const vueReactiveDependencies = new Tracker.Dependency
        const getHistoryLogQuery = getHistoryLog.clone()
        const loading = ref(false)
        const historyLog = ref([])

        let subscription
        let countSubscription

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

        const historyLogIcon = type => {
            switch (type) {
                case HistoryLogTypesEnum.INSERT: return 'person_add'
                case HistoryLogTypesEnum.UPDATE: return 'update'
                case HistoryLogTypesEnum.NOTES_UPDATE: return 'notes'
                case HistoryLogTypesEnum.ACTIVATION: return 'visibility'
                case HistoryLogTypesEnum.DEACTIVATION: return 'visibility_off'
                case HistoryLogTypesEnum.LINK: return 'link'
                case HistoryLogTypesEnum.UNLINK: return 'link_off'
                case HistoryLogTypesEnum.UNLINK_DELETE: return 'link_off'
            }
        }

        const isExpandBtnVisible = logItem => {
            const { type, metadata } = logItem
            const types = [
                HistoryLogTypesEnum.ACTIVATION,
                HistoryLogTypesEnum.DEACTIVATION
            ]

            return metadata && metadata.changeList && !types.includes(type)
        }

        const isChangeListLengthVisible = logItem => {
            const { type, metadata } = logItem
            const types = [
                HistoryLogTypesEnum.INSERT,
                HistoryLogTypesEnum.UPDATE
            ]

            return metadata && metadata.changeList && types.includes(type)
        }

        const getFieldName = path => {
            if (type.value === 'contacts') {
                if (path[0] === 'contactMethods' && path.length > 1) {
                    if (path.length === 3) {
                        return $t(`history_log.contacts_method_${path[2]}`, { index: path[1] + 2 })
                    }
                    return $t(`history_log.contacts_method`, { index: path[1] + 2 })
                }

                if (path[0] === 'tags' && path.length === 2) {
                    return $t('history_log.contacts_tag', { index: path[1] + 1 })
                }

                if (path.length === 2) {
                    return $t(`history_log.contacts_${path[0]}_${path[1]}`)
                }
                return $t(`history_log.contacts_${path[0]}`)
            }

            if (type.value === 'vehicles') {
                if (path[0] === 'tags' && path.length === 2) {
                    return $t('history_log.vehicles_tag', { index: path[1] + 1 })
                }

                return $t(`history_log.vehicles_${path[0]}`)
            }

            return path
        }

        const getOldValue = change => {
            const { oldValue, path } = change

            if (type.value === 'contacts') {
                if (path.includes('type')) {
                    return $t(`contacts.${oldValue}`)
                }

                if (path.length === 1 && (path[0] === 'deliveryAddress' || path[0] === 'billingAddress')) {
                    return Object.values(oldValue).join(', ')
                }

                if (path.length === 2 && path[0] === 'contactMethods') {
                    let output = $t(`contacts.${oldValue.type}`) + ': ' + oldValue.value

                    if (oldValue.description) {
                        output += ' | ' + $t('core.description') + ': ' + oldValue.description
                    }

                    return output
                }
            }

            if (type.value === 'vehicles') {
                if (path[0] === 'ownerId') {
                    return change.oldDeleted ? $t('history_log.deleted') : `${change.oldName} - ${change.oldCode}`
                }
            }

            return oldValue
        }

        const isOldValueUrl = change => {
            if (type.value === 'vehicles' && change.path[0] === 'ownerId' && !change.oldDeleted) {
                return true
            }
            return false
        }

        const getOldValueUrl = change => {
            if (type.value === 'vehicles' && change.path[0] === 'ownerId' && !change.oldDeleted) {
                return { name: 'ViewContact', params: { code: change.oldCode } }
            }
        }

        const getValue = change => {
            const { value, path } = change

            if (type.value === 'contacts') {
                if (path.includes('type')) {
                    return $t(`contacts.${value}`)
                }

                if (path.length === 1 && (path[0] === 'deliveryAddress' || path[0] === 'billingAddress')) {
                    return Object.values(value).join(', ')
                }

                if (path.length === 2 && path[0] === 'contactMethods') {
                    let output = $t(`contacts.${value.type}`) + ': ' + value.value

                    if (value.description) {
                        output += ' | ' + $t('core.description') + ': ' + value.description
                    }

                    return output
                }
            }

            if (type.value === 'vehicles') {
                if (path[0] === 'ownerId') {
                    return change.deleted ? $t('history_log.deleted') : `${change.name} - ${change.code}`
                }
            }

            return value
        }

        const isValueUrl = change => {
            if (type.value === 'vehicles' && change.path[0] === 'ownerId' && !change.deleted) {
                return true
            }
            return false
        }

        const getValueUrl = change => {
            if (type.value === 'vehicles' && change.path[0] === 'ownerId' && !change.deleted) {
                return { name: 'ViewContact', params: { code: change.code } }
            }
        }

        const getUnlinkDeleteDetails = metadata => {
            const { linkType: type } = metadata

            if (type === 'vehicle') {
                return metadata.vehicle.regNumber
                    ? `${metadata.vehicle.regNumber} - ${metadata.vehicle.makeModel}`
                    : `${metadata.vehicle.makeModel} (${metadata.vehicle.code})`
            }
        }

        const getLinkDetails = metadata => {
            const { linkType: type } = metadata

            if (type === 'vehicle') {
                return metadata.vehicle.regNumber
                    ? `${metadata.vehicle.regNumber} - ${metadata.vehicle.makeModel}`
                    : `${metadata.vehicle.makeModel} (${metadata.vehicle.code})`
            }

            return metadata[type]
        }

        const getLinkUrl = metadata => {
            const { linkType: type } = metadata

            if (type === 'vehicle') {
                return { name: 'ViewVehicle', params: { code: metadata.vehicle.code }}
            }
        }

        const updateHistoryLog = props => {
            pagination.value = props.pagination
            vueReactiveDependencies.changed()
        }

        const tracker = Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true
            
            getHistoryLogQuery.setParams({
                id: id.value,
                type: type.value,
                sortBy: pagination.value.sortBy,
                descending: pagination.value.descending,
                limit: pagination.value.rowsPerPage,
                skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
            })

            subscription = getHistoryLogQuery.subscribe()
            countSubscription = getHistoryLogQuery.subscribeCount()

            if (subscription.ready() && countSubscription.ready()) {
                historyLog.value = getHistoryLogQuery.fetch()
                pagination.value.rowsNumber = getHistoryLogQuery.getCount()

                historyLog.value.forEach(log => {
                    if (log.metadata && log.metadata.linkType === 'vehicle') {
                        getVehicleBasicDetails({ vehicleId: log.metadata.vehicle._id }).then(response => {
                            if (response) {
                                const { makeModel, regNumber } = response
                                log.metadata.vehicle.makeModel = makeModel
                                log.metadata.vehicle.regNumber = regNumber
                            } else {
                                log.metadata.vehicle.deleted = true
                            }
                        })
                    }

                    if (type.value === 'vehicles' && log.metadata && log.metadata.changeList) {
                        log.metadata.changeList.forEach(item => {
                            if (item.path.includes('ownerId')) {
                                if (item.value) {
                                    getContactBasicDetails({ contactId: item.value }).then(response => {
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
                                    getContactBasicDetails({ contactId: item.oldValue }).then(response => {
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

                loading.value = false
            }
        })

        onUnmounted(() => {
            subscription.stop()
            countSubscription.stop()
            tracker.stop()
        })

        return {
            HistoryLogTypesEnum,
            loading,
            historyLog,
            pagination,
            columns,
            formatDate,
            historyLogIcon,
            isExpandBtnVisible,
            isChangeListLengthVisible,
            getFieldName,
            getOldValue,
            getOldValueUrl,
            isOldValueUrl,
            getValue,
            getValueUrl,
            isValueUrl,
            getUnlinkDeleteDetails,
            getLinkDetails,
            getLinkUrl,
            updateHistoryLog
        }
    }
}
</script>

<style scoped>
#history-log-table tr.history-log-change-list > td {
    font-size: 12px;
    padding: 10px;
}
</style>
