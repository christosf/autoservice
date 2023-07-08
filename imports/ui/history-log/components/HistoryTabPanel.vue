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
                <q-td>{{ formatDate(props.row.createdAt, 'DD.MM.YYYY - HH:mm') }}</q-td>
                <q-td>
                    <span>{{ $t(`history_log.type_${props.row.type}`) }}</span>
                    <span v-if='isChangeListLengthVisible(props.row)'>
                        ({{ props.row.metadata.changeList.length }})
                    </span>
                </q-td>
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
                        v-if='isExpandBtnVisible(props.row.type)'
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
                    <div v-if='props.row.metadata' class='q-gutter-xs'>
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
                                        <div v-html='getValue(change)' />
                                    </div>
                                </div>
                                <div v-if='change.op === "remove"' class='col-12'>
                                    <div class='q-pa-sm'>
                                        <div v-html='getOldValue(change)' />
                                    </div>
                                </div>
                                <template v-if='change.op === "replace"'>
                                    <div class='col-xs-12 col-sm-6'>
                                        <div class='q-pa-sm'>
                                            <div class='text-bold'>{{ $t('history_log.value_prev') }}:</div>
                                            <div v-html='getOldValue(change)' />
                                        </div>
                                    </div>
                                    <div class='col-xs-12 col-sm-6'>
                                        <div class='q-pa-sm'>
                                            <div class='text-bold'>{{ $t('history_log.value_new') }}:</div>
                                            <div v-html='getValue(change)' />
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

export default {
    props: {
        id: String,
        type: String
    },
    setup(props) {
        const { t: $t } = useI18n()
        const { id, type } = toRefs(props)
        const { formatDate } = date

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
                name: 'createdAt',
                field: 'createdAt',
                label: 'core.date',
                sortable: true,
                align: 'left'
            },
            {
                name: 'action',
                field: 'type',
                label: 'core.action',
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
            }
        }

        const isExpandBtnVisible = type => ![HistoryLogTypesEnum.ACTIVATION, HistoryLogTypesEnum.DEACTIVATION].includes(type)

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

            return oldValue
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

            return value
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

                loading.value = false
            }
        })

        onUnmounted(() => {
            subscription.stop()
            countSubscription.stop()
            tracker.stop()
        })

        return {
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
            getValue,
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
