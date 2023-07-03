<template>
    <q-page padding>
        <q-table
            v-model:pagination='pagination'
            @request='updateContactList'
            :rows='contacts'
            :columns='columns'
            :loading='loading'
            :filter='filter'
            :visible-columns='visibleColumns'
            :rows-per-page-options='[15,30,50,100]'
            row-key='_id'
            id='contacts-table'
            binary-state-sort
            bordered
            flat
        >
            <template #top-left>
                <div class='text-h3'>{{ $t('contacts.many') }}</div>
            </template>
            <template #top-right>
                <div class='row q-gutter-sm'>
                    <q-btn-dropdown
                        :label='$t(`contacts.${statusFilter}`)'
                        :padding='$q.screen.lt.sm ? "sm" : "sm md"'
                        color='primary'
                        auto-close
                        no-caps
                        flat
                    >
                        <q-list :dense='$q.platform.is.desktop' separator>
                            <q-item
                                v-for='item in statusFilterItems'
                                @click='$router.push({ name: "ContactList", query: { view: item }})'
                                :active='statusFilter === item'
                                clickable
                            >
                                <q-item-section>
                                    <q-item-label>{{ $t(`contacts.${item}`) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    <q-input
                        v-model='filter'
                        :placeholder='`${$t("core.search")}...`'
                        :autofocus='$q.platform.is.desktop'
                        class='search-contacts'
                        ref='filterRef'
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
                <q-td :props='props' auto-width>
                    <router-link :to='{ name: "ViewContact", params: { code: props.row.code }}' class='text-black'>
                        {{ props.value }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-type='props'>
                <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' auto-width>
                    <router-link :to='{ name: "ViewContact", params: { code: props.row.code }}'>
                        <q-icon v-if='isCompany(props.value)' name='domain' color='primary' size='22px'>
                            <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('contacts.company') }}</q-tooltip>
                        </q-icon>
                        <q-icon v-else name='person' color='primary' size='22px'>
                            <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('contacts.individual') }}</q-tooltip>
                        </q-icon>
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-name='props'>
                <q-td :props='props'>
                    <router-link :to='{ name: "ViewContact", params: { code: props.row.code }}' class='text-black'>
                        {{ props.value }}
                    </router-link>
                </q-td>
            </template>
            <template #body-cell-phoneNumber='props'>
                <q-td :props='props' auto-width>
                    <a :href='`tel:${props.value}`' class='text-black'>
                        {{ props.value }}
                    </a>
                </q-td>
            </template>
            <template #body-cell-tags='props'>
                <q-td :props='props'>
                    <q-chip
                        v-if='props.value.length > 0'
                        v-for='tag in props.value'
                        @click='addTagFilter(tag)'
                        :label='tag'
                        clickable
                        square
                    />
                    <span v-else>-</span>
                </q-td>
            </template>
            <template #body-cell-operations='props'>
                <q-td :props='props' auto-width>
                    <div class='q-gutter-sm'>
                        <template v-if='props.row.isActive'>
                            <q-btn
                                @click='editContactDialogRef.open(props.row._id, props.row.code)'
                                icon='edit'
                                color='secondary'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deactivateContact(props.row._id)'
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
                                @click='activateContact(props.row._id)'
                                icon='visibility'
                                color='positive'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='deleteContact(props.row._id)'
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
        <edit-contact-dialog ref='editContactDialogRef' />
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta, date } from '../../quasar'
import { useContactAPI } from '../composables'
import { useErrorLogAPI } from '../../error-log/composables'
import EditContactDialog from '../components/EditContactDialog.vue'

export default {
    components: {
        EditContactDialog
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { formatDate } = date
        const {
            ContactTypesEnum,
            getContactList,
            activateContact: activateContactFn,
            deactivateContact: deactivateContactFn,
            deleteContact: deleteContactFn
        } = useContactAPI()
        const {
            insertErrorLog
        } = useErrorLogAPI()
        
        const vueReactiveDependencies = new Tracker.Dependency
        const editContactDialogRef = ref(null)
        const filterRef = ref(null)
                
        const loading = ref(true)
        const contacts = ref([])
        const visibleColumns = ref([])
        const filter = ref('')
        const statusFilter = ref('all')
        const statusFilterItems = ['all', 'customers', 'suppliers', 'deactivated']

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
                required: true
            },
            {
                name: 'name',
                label: 'contacts.name',
                field: 'name',
                required: true,
                sortable: true,
                align: 'left'
            },
            {
                name: 'phoneNumber',
                label: 'contacts.phone',
                field: 'phoneNumber',
                required: true,
                sortable: true,
                align: 'left'
            },
            {
                name: 'vehiclesCount',
                label: 'vehicles.many',
                field: 'vehiclesCount',
                sortable: true,
                align: 'center'
            },
            {
                name: 'tags',
                label: 'core.tags',
                field: 'tags',
                required: true,
                align: 'left'
            },
            {
                name: 'updatedAt',
                label: 'core.updated_at_short',
                field: 'updatedAt',
                format: v => formatDate(v, 'DD.MM.YYYY HH:mm'),
                required: true,
                sortable: true,
                align: 'left'
            },
            {
                name: 'code',
                label: 'core.code',
                field: 'code',
                required: true,
                sortable: true,
                align: 'left'
            },
            {
                name: 'operations',
                required: true,
                align: 'right',
                classes: 'contact-operations'
            }
        ]

        const updateContactList = props => {
            pagination.value = props.pagination
            vueReactiveDependencies.changed()
        }

        const isCompany = type => type === ContactTypesEnum.COMPANY

        const addTagFilter = tag => {
            filter.value = tag
            if ($q.platform.is.desktop) {
                nextTick(() => {
                    filterRef.value.select()
                })
            }
        }

        const activateContact = _id => {
            activateContactFn({ _id }).then(response => {
                const { activated } = response

                if (activated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('contacts.activate_successful')
                    })
                }
            }).catch(error => {
                insertErrorLog({
                    location: 'activateContact',
                    path: router.currentRoute.value.fullPath,
                    object: error
                })
            })
        }

        const deactivateContact = _id => {
            $q.dialog({
                title: $t('contacts.deactivate'),
                message: $t('contacts.deactivate_prompt_msg'),
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
                deactivateContactFn({ _id }).then(response => {
                    const { deactivated } = response

                    if (deactivated) {
                        $q.notify({
                            type: 'positive',
                            message: $t('contacts.deactivate_successful')
                        })
                    }
                }).catch(error => {
                    insertErrorLog({
                        location: 'deactivateContact',
                        path: router.currentRoute.value.fullPath,
                        object: error
                    })
                })
            })
        }

        const deleteContact = _id => {
            $q.dialog({
                title: $t('contacts.delete'),
                message: $t('contacts.delete_prompt_msg'),
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
                deleteContactFn({ _id }).then(response => {
                    const { deleted } = response

                    if (deleted) {
                        $q.notify({
                            type: 'positive',
                            message: $t('contacts.delete_successful')
                        })
                    }
                }).catch(error => {
                    if (error.error === 'vehicles-associated') {
                        $q.notify({
                            type: 'negative',
                            message: $t('contacts.error_associated_vehicles')
                        })
                    } else {
                        insertErrorLog({
                            location: 'deleteContact',
                            path: router.currentRoute.value.fullPath,
                            object: error
                        })
                    }
                })
            })
        }

        watch(statusFilter, () => {
            if (statusFilter.value === 'customers') {
                visibleColumns.value = ['vehiclesCount']
            } else {
                visibleColumns.value = []

                if (pagination.value.sortBy === 'vehiclesCount') {
                    pagination.value.sortBy = 'updatedAt'
                }
            }
            vueReactiveDependencies.changed()
        })

        watch(route, () => {
            if (route.name === 'ContactList') {
                const availableViews = ['customers', 'suppliers', 'deactivated']
                if (route.query.view && availableViews.includes(route.query.view)) {
                    statusFilter.value = route.query.view
                } else {
                    statusFilter.value = 'all'
                    router.replace({ name: 'ContactList' })
                }
            }
        }, { immediate: true })

        Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true

            const query = getContactList.clone({
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
                        insertErrorLog({
                            location: 'getContactListQueryCount',
                            path: router.currentRoute.value.fullPath,
                            object: error
                        })
                        return
                    }
                    pagination.value.rowsNumber = response
                })
                contacts.value = query.fetch()
                loading.value = false
            }
        })

        useMeta({
            title: $t('contacts.many')
        })

        return {
            editContactDialogRef,
            filterRef,
            loading,
            contacts,
            visibleColumns,
            filter,
            statusFilter,
            statusFilterItems,
            pagination,
            columns,
            updateContactList,
            isCompany,
            addTagFilter,
            activateContact,
            deactivateContact,
            deleteContact
        }
    }
}
</script>

<style scoped>
#contacts-table tbody td {
    font-size: 14px;
}

#contacts-table tbody td.dense {
    padding: 7px;
}

#contacts-table .search-contacts {
    width: 120px;
}

#contacts-table .q-chip {
    margin-left: 0;
    font-size: 12px;
}

#contacts-table .contact-operations {
    padding-left: 6px;
    padding-right: 10px;
}

#contacts-table th:last-child,
#contacts-table td:last-child {
    background-color: #ffffff;
    position: sticky;
    right: 0;
    z-index: 1;
}
</style>
