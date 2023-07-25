<template>
  <q-page padding>
    <q-table
      v-model:pagination='pagination'
      @request='updateVehicleList'
      :rows='vehicles'
      :columns='columns'
      :loading='loading'
      :filter='filter'
      :rows-per-page-options='[10,20,30,50]'
      row-key='_id'
      id='vehicles-table'
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
            class='search-vehicles'
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
          <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}' class='text-black'>
            {{ props.value }}
          </router-link>
        </q-td>
      </template>
      <template #body-cell-type='props'>
        <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' auto-width>
          <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}'>
            <q-icon name='sym_o_directions_car' color='primary' size='22px' />
          </router-link>
        </q-td>
      </template>
      <template #body-cell-model='props'>
        <q-td :props='props'>
          <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}' class='text-black'>
            {{ props.value }}
          </router-link>
        </q-td>
      </template>
      <template #body-cell-owner='props'>
        <q-td :props='props' auto-width>
          <router-link
            :to='{ name: "ViewContact", params: { code: props.value.code }}'
            class='text-secondary'
          >
            {{ props.value.name }}
          </router-link>
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
                icon='sym_o_visibility'
                color='positive'
                size='sm'
                outline
                dense
              >
                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
              </q-btn>
              <q-btn
                @click='deleteVehicle(props.row._id)'
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
    <edit-vehicle-dialog ref='editDialogRef' />
  </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useQuasar, useMeta, date } from '../../quasar'
import { useVehicleAPI, useVehicleFunctions } from '../composables'
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
    const { getVehicleList } = useVehicleAPI()
    const { formatDate } = date

    const {
      deleteVehicle,
      activateVehicle,
      deactivateVehicle
    } = useVehicleFunctions()

    const vueReactiveDependencies = new Tracker.Dependency()
    const getVehicleListQuery = getVehicleList.clone()
    const editDialogRef = ref(null)
    const filterRef = ref(null)
    const loading = ref(true)
    const vehicles = ref([])
    const filter = ref('')
    const availableViews = ['deactivated']
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
        field: 'type'
      },
      {
        name: 'regNumber',
        label: 'vehicles.reg_number_short',
        field: 'regNumber',
        sortable: true,
        align: 'left'
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
        field: 'owner',
        align: 'left'
      },
      {
        name: 'tags',
        label: 'core.tags',
        field: 'tags',
        align: 'left'
      },
      {
        name: 'updatedAt',
        label: 'core.updated_at_short',
        field: 'updatedAt',
        format: (v) => formatDate(v, 'DD.MM.YYYY HH:mm'),
        sortable: true,
        align: 'left'
      },
      {
        name: 'code',
        label: 'core.code',
        field: 'code',
        sortable: true,
        align: 'left'
      },
      {
        name: 'operations',
        align: 'right',
        classes: 'operations'
      }
    ]

    const tableTitle = computed(() => {
      switch (route.params.view) {
        case 'deactivated': return $t('vehicles.deactivated_vehicles')
        default: return $t('vehicles.many')
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
      $q.localStorage.set('vehicleListPagination', {
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        rowsPerPage: pagination.value.rowsPerPage
      })
    }

    const updateVehicleList = (props) => {
      pagination.value = props.pagination
      setLocalStorage()
      vueReactiveDependencies.changed()
    }

    watch(route, () => {
      if (route.name === 'VehicleList') {
        if (route.params.view && !availableViews.includes(route.params.view)) {
          router.replace({ name: 'VehicleList' })
          return
        }

        vueReactiveDependencies.changed()
      }
    }, { immediate: true })

    const tracker = Tracker.autorun(() => {
      vueReactiveDependencies.depend()
      loading.value = true

      getVehicleListQuery.setParams({
        filter: filter.value ? filter.value : '',
        statusFilter: route.params.view ? route.params.view : '',
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        limit: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
      })
      subscription = getVehicleListQuery.subscribe()
      countSubscription = getVehicleListQuery.subscribeCount()

      if (subscription.ready() && countSubscription.ready()) {
        vehicles.value = getVehicleListQuery.fetch()
        pagination.value.rowsNumber = getVehicleListQuery.getCount()
        loading.value = false
      }
    })

    onUnmounted(() => {
      countSubscription.stop()
      subscription.stop()
      tracker.stop()
    })

    onMounted(() => {
      if ($q.localStorage.has('vehicleListPagination')) {
        const localStoragePagination = $q.localStorage.getItem('vehicleListPagination')

        pagination.value.sortBy = localStoragePagination.sortBy
        pagination.value.descending = localStoragePagination.descending
        pagination.value.rowsPerPage = localStoragePagination.rowsPerPage
      } else {
        setLocalStorage()
      }
    })

    useMeta({
      title: $t('vehicles.many')
    })

    return {
      editDialogRef,
      filterRef,
      loading,
      vehicles,
      filter,
      pagination,
      columns,
      tableTitle,
      activateVehicle,
      deactivateVehicle,
      deleteVehicle,
      addTagFilter,
      updateVehicleList
    }
  }
}
</script>

<style>
#vehicles-table .search-vehicles {
  width: 300px;
}

#vehicles-table .search-vehicles.small {
  width: 120px;
}

#vehicles-table .q-chip {
  margin-left: 0;
  font-size: 12px;
}
</style>
