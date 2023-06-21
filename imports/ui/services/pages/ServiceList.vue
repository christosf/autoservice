<template>
    <q-page padding>
        <q-table
            v-model:pagination='pagination'
            @request='updateServiceList'
            :rows='services'
            :columns='columns'
            :loading='loading'
            :filter='filter'
            :rows-per-page-options='[15,30,50,100]'
            row-key='_id'
            id='services-table'
            binary-state-sort
            bordered
            flat
        >
            <template #top-left>
                <div class='text-h6'>{{ $t('services.many') }}</div>
            </template>
            <template #top-right>
                <div class='row q-gutter-sm'>
                    <q-btn-dropdown
                        :label='$t(`services.${statusFilter}`)'
                        :padding='$q.screen.lt.sm ? "sm" : "sm md"'
                        color='primary'
                        auto-close
                        no-caps
                        flat
                    >
                        <q-list :dense='$q.platform.is.desktop' separator>
                            <q-item
                                v-for='item in statusFilterItems'
                                @click='$router.push({ name: "ServiceList", query: { view: item }})'
                                :active='statusFilter === item'
                                clickable
                            >
                                <q-item-section>
                                    <q-item-label>{{ $t(`services.${item}`) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    <q-input
                        v-model='filter'
                        :placeholder='$t("core.search_td")'
                        :autofocus='$q.platform.is.desktop'
                        input-class='text-uppercase'
                        ref='filterRef'
                        class='search-services'
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
                    {{ props.value || props.value >= 0 ? props.value : '-' }}
                </q-td>
            </template>
            <template #body-cell-type='props'>
                <q-td :props='props' :class='{"dense": $q.screen.lt.sm}'>
                    <q-icon name='design_services' color='primary' size='22px' />
                </q-td>
            </template>
            <template #body-cell-name='props'>
                <q-td :props='props' :class='{"dense": $q.screen.lt.sm}'>
                    <span>
                        {{ props.value }}
                        <q-tooltip v-if='props.row.description'>{{ props.row.description }}</q-tooltip>
                    </span>
                </q-td>
            </template>
            <template #body-cell-ratePerHour='props'>
                <q-td :props='props'>
                    {{ props.value >= 0 ? '&euro; ' + props.value : '-' }}
                </q-td>
            </template>
            <template #body-cell-tags='props'>
                <q-td :props='props'>
                    <q-chip
                        v-for='tag in props.value'
                        @click='addTagFilter(tag)'
                        :label='tag'
                        class='q-ml-none'
                        style='font-size: 12px;'
                        clickable
                        square
                    />
                    {{ props.value.length === 0 ? '-' : '' }}
                </q-td>
            </template>
            <template #body-cell-noVat='props'>
                <q-td :props='props'>
                    {{ props.value ? $t('core.no') : $t('core.yes') }}
                </q-td>
            </template>
            <template #body-cell-operations='props'>
                <q-td :props='props'>
                    <div class='q-gutter-sm'>
                        <template v-if='props.row.active'>
                            <q-btn
                                @click='editServiceDialogRef.open(props.row._id, props.row.code)'
                                icon='edit'
                                color='secondary'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deactivateService(props.row._id)'
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
                                @click='activateService(props.row._id)'
                                icon='visibility'
                                color='positive'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deleteService(props.row._id)'
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
        <edit-service-dialog ref='editServiceDialogRef' />
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { nextTick, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta, date } from '../../quasar'
import { useServicesApi } from '../composables'
import EditServiceDialog from '../components/EditServiceDialog.vue'

export default {
    components: {
        EditServiceDialog
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { formatDate } = date
        const {
            getServiceList,
            deleteService: deleteServiceFn,
            activateService: activateServiceFn,
            deactivateService: deactivateServiceFn
        } = useServicesApi()

        const vueReactiveDependencies = new Tracker.Dependency
        const editServiceDialogRef = ref(null)
        const filterRef = ref(null)

        const loading = ref(true)
        const services = ref([])
        const filter = ref('')
        const statusFilter = ref('all')
        const statusFilterItems = ['all', 'deactivated']

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
                classes: 'service-type'
            },
            {
                name: 'name',
                label: 'core.name',
                field: 'name',
                sortable: true,
                align: 'left'
            },
            {
                name: 'ratePerHour',
                label: 'services.rate_per_hour',
                field: 'ratePerHour',
                align: 'center'
            },
            {
                name: 'hours',
                label: 'services.man_hours',
                field: 'hours',
                align: 'center'
            },
            {
                name: 'tags',
                label: 'core.tags',
                field: 'tags',
                align: 'left'
            },
            {
                name: 'noVat',
                label: 'core.vat',
                field: 'noVat',
                align: 'center'
            },
            {
                name: 'updatedAt',
                label: 'core.updated_at_short',
                field: 'updatedAt',
                format: val => formatDate(val, 'DD.MM.YYYY HH:mm'),
                sortable: true,
                align: 'left',
                classes: 'service-date'
            },
            {
                name: 'code',
                label: 'core.code',
                field: 'code',
                sortable: true,
                align: 'left',
                classes: 'service-code'
            },
            {
                name: 'operations',
                align: 'right',
                classes: 'service-operations'
            }
        ]

        const updateServiceList = props => {
            pagination.value = props.pagination
            vueReactiveDependencies.changed()
        }

        const addTagFilter = tag => {
            filter.value = tag
            if ($q.platform.is.desktop) {
                nextTick(() => {
                    filterRef.value.select()
                })
            }
        }

        const activateService = serviceId => {
            activateServiceFn({ _id: serviceId }).then(response => {
                const { activated } = response

                if (activated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('services.activate_successful')
                    })
                }
            }).catch(error => {
                console.log(error)
            })
        }

        const deactivateService = serviceId => {
            $q.dialog({
                title: $t('services.deactivate'),
                message: $t('services.deactivate_prompt_msg'),
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
                deactivateServiceFn({ _id: serviceId }).then(response => {
                    const { deactivated } = response

                    if (deactivated) {
                        $q.notify({
                            type: 'positive',
                            message: $t('services.deactivate_successful')
                        })
                    }
                }).catch(error => {
                    console.log(error)
                })
            })
        }

        const deleteService = serviceId => {
            $q.dialog({
                title: $t('services.delete'),
                message: $t('services.delete_prompt_msg'),
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
                deleteServiceFn({ _id: serviceId }).then(response => {
                    const { deleted } = response

                    if (deleted) {
                        $q.notify({
                            type: 'positive',
                            message: $t('services.delete_successful')
                        })
                    }
                }).catch(error => {
                    console.log(error)
                })
            })
        }

        watch(statusFilter, () => vueReactiveDependencies.changed())

        watch(route, () => {
            if (route.name === 'ServiceList') {
                const availableViews = ['deactivated']
                if (route.query.view && availableViews.includes(route.query.view)) {
                    statusFilter.value = route.query.view
                } else {
                    statusFilter.value = 'all'
                    router.replace({ name: 'ServiceList' })
                }
            }
        }, { immediate: true })

        Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true

            const query = getServiceList.clone({
                filter: filter.value,
                statusFilter: statusFilter.value,
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

                services.value = query.fetch()
                loading.value = false
            }
        })

        useMeta({
            title: $t('services.many')
        })

        return {
            editServiceDialogRef,
            filterRef,
            loading,
            services,
            filter,
            statusFilter,
            statusFilterItems,
            pagination,
            columns,
            updateServiceList,
            addTagFilter,
            activateService,
            deactivateService,
            deleteService
        }
    }
}
</script>

<style>
#services-table tbody td {
    font-size: 14px;
}

#services-table .search-services {
    width: 120px;
}

#services-table .service-type {
    width: 22px;
}
#services-table .service-type.dense {
    padding-right: 0;
    padding-left: 0;
}

#services-table .service-reg-number {
    width: 130px;
}

#services-table .service-code {
    width: 50px;
}

#services-table .service-date {
    width: 150px;
}

#services-table .service-operations {
    width: 70px;
    padding-left: 6px;
    padding-right: 10px;
}

#services-table th:last-child,
#services-table td:last-child {
    background-color: #ffffff;
    position: sticky;
    right: 0;
    z-index: 1;
}
</style>
