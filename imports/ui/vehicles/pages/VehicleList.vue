<template>
    <q-page padding>
        <q-table
            v-model:pagination='pagination'
            @request='updateVehicleList'
            :rows='vehicles'
            :columns='columns'
            :loading='loading'
            :filter='filter'
            :rows-per-page-options='[1,15,30,50,100]'
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
                        :label='$t(`vehicles.${customFilter}`)'
                        :padding='$q.screen.lt.sm ? "sm" : "sm md"'
                        color='primary'
                        auto-close
                        no-caps
                        flat
                    >
                        <q-list :dense='$q.platform.is.desktop' separator>
                            <q-item
                                v-for='item in customFilterItems'
                                @click='$router.push({ name: "VehicleList", query: { view: item }})'
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
                        :autofocus='$q.platform.is.desktop'
                        input-class='text-uppercase'
                        class='search-vehicles'
                        debounce='400'
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
                    {{ props.col.label ? $t(props.col.label) : '' }}
                </q-th>
            </template>
            <template #body-cell='props'>
                <q-td :props='props'>
                    <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}' class='text-black'>
                        {{ props.value ? props.value : '-' }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-type='props'>
                <q-td :props='props' :class='{"dense": $q.screen.lt.sm}'>
                    <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}'>
                        <q-icon name='directions_car' color='primary' size='22px' />
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-owner='props'>
                <q-td :props='props'>
                    <router-link :to='{ name: "ViewContact", params: { code: props.row.owner.code }}' class='text-black'>
                        {{ props.value }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-operations='props'>
                <q-td :props='props'>
                    <div class='q-gutter-sm'>
                        <template v-if='props.row.active'>
                            <q-btn
                                @click='editVehicleDialogRef.open(props.row._id, props.row.code)'
                                icon='edit'
                                color='secondary'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deactivateVehicle(props.row._id)'
                                icon='visibility_off'
                                color='negative'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.deactivate') }}</q-tooltip>
                            </q-btn>
                        </template>
                        <template v-else>
                            <q-btn
                                @click='activateVehicle(props.row._id)'
                                icon='visibility'
                                color='positive'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deleteVehicle(props.row._id)'
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
        <edit-vehicle-dialog ref='editVehicleDialogRef' />
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta, date } from '../../quasar'
import { useVehiclesApi } from '../composables'
import EditVehicleDialog from '../components/EditVehicleDialog.vue'

export default {
    components: {
        EditVehicleDialog
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { formatDate } = date
        const {
            getVehicleList,
            deleteVehicle: deleteVehicleFn,
            activateVehicle: activateVehicleFn,
            deactivateVehicle: deactivateVehicleFn
        } = useVehiclesApi()

        const vueReactiveDependencies = new Tracker.Dependency
        const editVehicleDialogRef = ref(null)

        const loading = ref(true)
        const vehicles = ref([])
        const filter = ref('')
        const customFilter = ref('all')
        const customFilterItems = ['all', 'deactivated']

        const pagination = ref({
            sortBy: 'updatedAt',
            descending: false,
            page: 1,
            rowsPerPage: 15,
            rowsNumber: 0
        })

        const columns = [
            {
                name: 'type',
                field: 'type',
                classes: 'vehicle-type',
            },
            {
                name: 'regNumber',
                label: 'vehicles.reg_number_short',
                field: 'regNumber',
                sortable: true,
                align: 'left',
                classes: 'vehicle-reg-number'
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
                name: 'owner',
                label: 'vehicles.owner',
                field: row => row.owner.name,
                align: 'left'
            },
            {
                name: 'updatedAt',
                label: 'core.updated_at_short',
                field: 'updatedAt',
                format: val => formatDate(val, 'DD.MM.YYYY HH:mm'),
                sortable: true,
                align: 'left',
                classes: 'vehicle-date'
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
                name: 'operations',
                align: 'right',
                classes: 'vehicle-operations'
            }
        ]

        const updateVehicleList = props => {
            pagination.value = props.pagination
            vueReactiveDependencies.changed()
        }

        const activateVehicle = vehicleId => {
            activateVehicleFn({ _id: vehicleId }).then(response => {
                const { activated } = response

                if (activated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('vehicles.activate_successful')
                    })
                }
            }).catch(error => {
                console.log(error)
            })
        }

        const deactivateVehicle = vehicleId => {
            $q.dialog({
                title: $t('vehicles.deactivate'),
                message: $t('vehicles.deactivate_prompt_msg'),
                cancel: true,
                persistent: true,
                ok: {
                    label: $t('core.deactivate'),
                    color: 'negative',
                    icon: 'visibility_off',
                    noCaps: true
                },
                cancel: {
                    color: 'black',
                    icon: 'cancel',
                    flat: true,
                    noCaps: true
                }
            }).onOk(() => {
                deactivateVehicleFn({ _id: vehicleId }).then(response => {
                    const { deactivated } = response

                    if (deactivated) {
                        $q.notify({
                            type: 'positive',
                            message: $t('vehicles.deactivate_successful')
                        })
                    }
                }).catch(error => {
                    console.log(error)
                })
            })
        }

        const deleteVehicle = vehicleId => {
            $q.dialog({
                title: $t('vehicles.delete'),
                message: $t('vehicles.delete_prompt_msg'),
                cancel: true,
                persistent: true,
                ok: {
                    label: $t('core.delete'),
                    color: 'negative',
                    icon: 'delete',
                    noCaps: true
                },
                cancel: {
                    color: 'black',
                    icon: 'cancel',
                    flat: true,
                    noCaps: true
                }
            }).onOk(() => {
                deleteVehicleFn({ _id: vehicleId }).then(response => {
                    const { deleted } = response

                    if (deleted) {
                        $q.notify({
                            type: 'positive',
                            message: $t('vehicles.delete_successful')
                        })
                    }
                }).catch(error => {
                    /*
                    if (error.error === 'vehicles-associated') {
                        $q.notify({
                            type: 'negative',
                            message: $t('contacts.error_associated_vehicles')
                        })
                    } else {
                        console.log(error)
                    }*/
                    console.log(error)
                })
            })
        }

        watch(customFilter, () => vueReactiveDependencies.changed())

        watch(route, () => {
            if (route.query.view === 'all') {
                router.replace({ name: 'VehicleList' })
            }

            if (['deactivated'].includes(route.query.view)) {
                customFilter.value = route.query.view
            } else {
                customFilter.value = 'all'
            }
        }, { immediate: true })
        
        Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true

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
            customFilterItems,
            pagination,
            columns,
            updateVehicleList,
            activateVehicle,
            deactivateVehicle,
            deleteVehicle
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

#vehicles-table .vehicle-reg-number {
    width: 130px;
}

#vehicles-table .vehicle-code {
    width: 50px;
}

#vehicles-table .vehicle-date {
    width: 150px;
}

#vehicles-table .vehicle-operations {
    width: 90px;
}

#vehicles-table th:last-child,
#vehicles-table td:last-child {
    background-color: #ffffff;
    position: sticky;
    right: 0;
    z-index: 1;
}
</style>
