<template>
    <q-page padding>
        <q-table
            v-model:pagination='pagination'
            @request='updateVehicleList'
            :rows='vehicles'
            :columns='columns'
            :loading='loading'
            :filter='filter'
            :rows-per-page-options='[10,25,50,0]'
            row-key='_id'
            id='vehicles-table'
            binary-state-sort
            bordered
            flat
        >
            <template #top-left>
                <div class='text-h6 q-pr-md'>{{ $t('vehicles.many') }}</div>
            </template>
            <template #top-right>
                <div class='row q-gutter-sm'>
                    <q-btn-dropdown
                        :label='customFilterLabel'
                        color='primary'
                        auto-close
                        flat
                        no-caps
                    >
                        <q-list dense separator>
                            <q-item
                                v-for='item in customFilterItems'
                                @click='customFilter = item'
                                :active='customFilter === item'
                                clickable
                            >
                                <q-item-section>
                                    <q-item-label>{{ $t(`vehicles.${item}`) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    <q-input
                        v-model='filter'
                        :placeholder='$t("core.search_td")'
                        input-class='text-uppercase'
                        class='search-vehicles'
                        debounce='400'
                        autofocus
                        borderless
                        dense
                    >
                        <template #prepend>
                            <q-icon name='search' />
                        </template>
                    </q-input>
                </div>
            </template>
            <template #header-cell='props'>
                <q-th :props='props'>
                    {{ props.col.label ? $t(props.col.label) : undefined }}
                </q-th>
            </template>
            <template #body-cell='props'>
                <q-td :props='props'>
                    <router-link
                        :to='{ name: "ViewVehicle", params: { code: props.row.code }}'
                        class='text-black'
                    >
                        {{ props.value ? props.value : '-' }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-type='props'>
                <q-td :props='props' :class='{"dense": $q.screen.lt.sm}'>
                    <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}'>
                        <q-icon
                            name='directions_car'
                            color='primary'
                            size='22px'
                        />
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-owner='props'>
                <q-td :props='props'>
                    <router-link
                        :to='{ name: "ViewContact", params: { code: props.row.owner.code }}'
                        class='text-black'
                    >
                        {{ props.value }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-operations='props'>
                <q-td :props='props'>
                    <div class='q-gutter-sm'>
                        <q-btn
                            v-if='props.row.active'
                            @click='editVehicleDialogRef.open(props.row._id, props.row.code)'
                            icon='edit'
                            color='primary'
                            size='sm'
                            outline
                            dense
                        >
                            <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                        </q-btn>
                        <q-btn
                            v-if='props.row.active'
                            @click='softDeleteVehicle(props.row._id)'
                            icon='delete'
                            color='negative'
                            size='sm'
                            outline
                            dense
                        >
                            <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.delete') }}</q-tooltip>
                        </q-btn>
                        <template v-else>
                            <q-btn
                                @click='restoreVehicle(props.row._id)'
                                icon='undo'
                                color='positive'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.restore') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='permanentDeleteVehicle(props.row._id)'
                                icon='delete'
                                color='negative'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.permanent_delete') }}</q-tooltip>
                            </q-btn>
                        </template>
                    </div>
                </q-td>
            </template>
        </q-table>
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useVehicles } from '../composables'

export default {
    setup() {
        const router = useRouter()
        const route = useRoute()
        const $q = useQuasar()
        const { t: $t } = useI18n()

        const editVehicleDialogRef = ref(null)
        const {
            getVehicleList
        } = useVehicles()

        const vueReactiveDependencies = new Tracker.Dependency
        const loading = ref(true)
        const vehicles = ref([])
        const filter = ref('')
        const customFilter = ref('all')
        const pagination = ref({
            sortBy: 'code',
            descending: false,
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })

        const columns = [
            {
                name: 'type',
                field: 'type',
                classes: 'vehicle-type',
            },
            {
                name: 'code',
                label: 'core.code',
                field: 'code',
                sortable: true,
                align: 'left',
                classes: 'vehicle-code'
            },
            {
                name: 'make',
                label: 'vehicles.make',
                field: 'make',
                sortable: true,
                align: 'left'
            },
            {
                name: 'model',
                label: 'vehicles.model',
                field: 'model',
                sortable: true,
                align: 'left'
            },
            {
                name: 'regNumber',
                label: 'vehicles.reg_number_short',
                field: 'regNumber',
                sortable: true,
                align: 'left'
            },
            {
                name: 'chassisNumber',
                label: 'vehicles.chassis_number_short',
                field: 'chassisNumber',
                sortable: true,
                align: 'left'
            },
            {
                name: 'owner',
                label: 'vehicles.owner',
                field: row => row.owner.name,
                align: 'left'
            },
            {
                name: 'operations',
                align: 'right'
            }
        ]

        const customFilterItems = ['all', 'deactivated']

        const updateVehicleList = props => {
            pagination.value = props.pagination
            vueReactiveDependencies.changed()
        }

        const customFilterLabel = computed(() => {
            switch(customFilter.value) {
                case 'deactivated': return $t('vehicles.deactivated')
                default: return $t('vehicles.all')
            }
        })

        watch(customFilter, () => vueReactiveDependencies.changed())

        watch(route, () => {
            if ('deactivated' in route.query) {
                customFilter.value = 'deactivated'
                router.replace({ name: 'VehicleList' })
            }
        }, { immediate: true })
        
        Tracker.autorun(() => {
            loading.value = true

            vueReactiveDependencies.depend()

            const query = getVehicleList.clone({
                filter: filter.value,
                customFilter: customFilter.value,
                sortBy: pagination.value.sortBy,
                descending: pagination.value.descending,
                limit: pagination.value.rowsPerPage,
                skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
            })
            const subscription = query.subscribe()

            if (subscription.ready()) {
                query.getCount((error, response) => {
                    if (error) {
                        console.log(error)
                        return
                    }
                    pagination.value.rowsNumber = response
                })

                vehicles.value = query.fetch()
                loading.value = false
            }
        })

        useMeta({
            title: $t('vehicles.many')
        })

        return {
            editVehicleDialogRef,
            loading,
            vehicles,
            filter,
            customFilter,
            pagination,
            columns,
            customFilterItems,
            updateVehicleList,
            customFilterLabel
        }
    }   
}
</script>

<style>
#vehicles-table tbody td {
    font-size: 14px;
}

#vehicles-table .search-vehicles {
    width: 120px;
}

#vehicles-table .vehicle-type {
    width: 22px;
}
#vehicles-table .vehicle-type.dense {
    padding-right: 0;
    padding-left: 0;
}

#vehicles-table .vehicle-code {
    width: 50px;
}

#vehicles-table th:last-child,
#vehicles-table td:last-child {
    background-color: #ffffff;
    position: sticky;
    right: 0;
    z-index: 1;
}
</style>
