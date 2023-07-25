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
      :rows-per-page-options='[10,20,30,50]'
      row-key='_id'
      id='contacts-table'
      binary-state-sort
      bordered
      flat
    >
      <template #top-left>
        <div class='text-h4 text-bold'>{{ tableTitle }}</div>
      </template>
      <template #top-right>
        <div class='row q-gutter-sm'>
          <q-input
            v-model='filter'
            :placeholder='`${$t("core.search")}...`'
            :clearable='$q.screen.gt.sm'
            :autofocus='$q.platform.is.desktop'
            :borderless='$q.screen.lt.md'
            :outlined='$q.screen.gt.sm'
            :class='{ "small": $q.screen.lt.md }'
            class='search-contacts'
            ref='filterRef'
            debounce='400'
            dense
          >
            <template #prepend>
              <q-icon name='sym_o_search' />
            </template>
          </q-input>
        </div>
      </template>
      <template #header-cell='props'>
        <q-th :props='props' :class='props.col.classes'>
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
            <q-icon v-if='isCompany(props.value)' name='sym_o_domain' color='primary' size='22px'>
              <q-tooltip anchor='top middle' self='bottom middle'>
                {{ $t('contacts.company') }}
              </q-tooltip>
            </q-icon>
            <q-icon v-else name='sym_o_person' color='primary' size='22px'>
              <q-tooltip anchor='top middle' self='bottom middle'>
                {{ $t('contacts.individual') }}
              </q-tooltip>
            </q-icon>
          </router-link>
        </q-td>
      </template>
      <template #body-cell-name='props'>
        <q-td :props='props'>
          <router-link
            :to='{ name: "ViewContact", params: { code: props.row.code }}'
            class='text-black'
          >
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
          <template v-if='props.value.length > 0'>
            <q-chip
              v-for='tag in props.value'
              @click='addTagFilter(tag)'
              :label='tag'
              :key='tag'
              clickable
              square
            />
          </template>
          <span v-else>-</span>
        </q-td>
      </template>
      <template #body-cell-operations='props'>
        <q-td :props='props' auto-width>
          <div class='q-gutter-sm'>
            <template v-if='props.row.isActive'>
              <q-btn
                @click='editDialogRef.open(props.row._id, props.row.code)'
                icon='sym_o_edit'
                color='secondary'
                size='sm'
                outline
                dense
              >
                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                @click='deactivateContact(props.row._id)'
                icon='sym_o_visibility_off'
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
                icon='sym_o_visibility'
                color='positive'
                size='sm'
                outline
                dense
              >
                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
              </q-btn>
              <q-btn
                @click='deleteContact(props.row._id)'
                icon='sym_o_delete'
                color='negative'
                size='sm'
                outline
                dense
              >
                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.delete') }}</q-tooltip>
              </q-btn>
            </template>
          </div>
        </q-td>
      </template>
    </q-table>
    <edit-contact-dialog ref='editDialogRef' />
  </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useQuasar, useMeta, date } from '../../quasar'
import { useContactAPI, useContactFunctions } from '../composables'
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
    const { getContactList } = useContactAPI()
    const { formatDate } = date

    const {
      isCompany,
      deleteContact,
      activateContact,
      deactivateContact
    } = useContactFunctions()

    const vueReactiveDependencies = new Tracker.Dependency()
    const getContactListQuery = getContactList.clone()
    const editDialogRef = ref(null)
    const filterRef = ref(null)
    const loading = ref(true)
    const contacts = ref([])
    const visibleColumns = ref([])
    const filter = ref('')
    const availableViews = ['customers', 'suppliers', 'deactivated']
    let subscription
    let countSubscription

    const pagination = ref({
      sortBy: 'updatedAt',
      descending: true,
      page: 1,
      rowsPerPage: 10,
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
        name: 'vehicleCount',
        label: 'vehicles.many',
        field: 'vehicleCount',
        sortable: true,
        align: 'left'
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
        format: (v) => formatDate(v, 'DD.MM.YYYY - HH:mm'),
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
        classes: 'operations'
      }
    ]

    const tableTitle = computed(() => {
      switch (route.params.view) {
        case 'customers': return $t('contacts.customers')
        case 'suppliers': return $t('contacts.suppliers')
        case 'deactivated': return $t('contacts.deactivated_contacts')
        default: return $t('contacts.many')
      }
    })

    const addTagFilter = (tag) => {
      filter.value = tag
      if ($q.platform.is.desktop) {
        nextTick(() => {
          filterRef.value.select()
        })
      }
    }

    const setLocalStorage = () => {
      $q.localStorage.set('contactListPagination', {
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        rowsPerPage: pagination.value.rowsPerPage
      })
    }

    const updateContactList = (props) => {
      pagination.value = props.pagination
      setLocalStorage()
      vueReactiveDependencies.changed()
    }

    watch(route, () => {
      if (route.name === 'ContactList') {
        if (route.params.view && !availableViews.includes(route.params.view)) {
          router.replace({ name: 'ContactList' })
          return
        }

        if (route.params.view === 'customers') {
          visibleColumns.value = ['vehicleCount']
        } else {
          visibleColumns.value = []

          if ($q.localStorage.has('contactListPagination')) {
            const localStoragePagination = $q.localStorage.getItem('contactListPagination')

            if (
              localStoragePagination.sortBy === 'vehicleCount'
              || pagination.value.sortBy === 'vehicleCount'
            ) {
              pagination.value.sortBy = 'updatedAt'
              setLocalStorage()
            }
          }
        }

        vueReactiveDependencies.changed()
      }
    }, { immediate: true })

    const tracker = Tracker.autorun(() => {
      vueReactiveDependencies.depend()
      loading.value = true

      getContactListQuery.setParams({
        filter: filter.value ? filter.value : '',
        statusFilter: route.params.view ? route.params.view : '',
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        limit: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
      })
      subscription = getContactListQuery.subscribe()
      countSubscription = getContactListQuery.subscribeCount()

      if (subscription.ready() && countSubscription.ready()) {
        contacts.value = getContactListQuery.fetch()
        pagination.value.rowsNumber = getContactListQuery.getCount()
        loading.value = false
      }
    })

    onUnmounted(() => {
      countSubscription.stop()
      subscription.stop()
      tracker.stop()
    })

    onMounted(() => {
      if ($q.localStorage.has('contactListPagination')) {
        const localStoragePagination = $q.localStorage.getItem('contactListPagination')

        pagination.value.sortBy = localStoragePagination.sortBy
        pagination.value.descending = localStoragePagination.descending
        pagination.value.rowsPerPage = localStoragePagination.rowsPerPage
      } else {
        setLocalStorage()
      }
    })

    useMeta({
      title: $t('contacts.many')
    })

    return {
      editDialogRef,
      filterRef,
      loading,
      contacts,
      visibleColumns,
      filter,
      pagination,
      columns,
      tableTitle,
      isCompany,
      deleteContact,
      activateContact,
      deactivateContact,
      addTagFilter,
      updateContactList
    }
  }
}
</script>

<style scoped>
#contacts-table .search-contacts {
  width: 300px;
}

#contacts-table .search-contacts.small {
  width: 120px;
}

#contacts-table .q-chip {
  margin-left: 0;
  font-size: 12px;
}
</style>
