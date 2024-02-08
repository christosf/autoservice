<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, computed, inject, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useVehicleAPI, useVehicleFunctions } from '../composables'
import { useCoreFunctions } from '../../core/composables'
import VehicleFormDialog from '../components/VehicleFormDialog.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const { getVehicleListQuery } = useVehicleAPI()
const { removeVehicle, activateVehicle, deactivateVehicle } = useVehicleFunctions()
const { localizedFormat } = useCoreFunctions()

const insertVehicleDialogRef = inject('insertVehicleDialogRef')
const updateVehicleDialogRef = ref(null)
const filterRef = ref(null)
const vueDependency = new Tracker.Dependency()
const getVehicleList = getVehicleListQuery.clone()
const isLoading = ref(true)
const vehicles = ref([])
const filter = ref('')
const availableViews = ['deactivated']

const pagination = ref({
  sortBy: 'updatedAt',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  {
    name: 'type',
    field: 'type',
    align: 'center'
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
    format: (v) => localizedFormat({ date: v, format: 'dd.MM.yyyy - HH:mm' }),
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

const title = computed(() => {
  if (route.params.view === 'deactivated') { return $t('vehicles.deactivated_vehicles') }

  return $t('vehicles.many')
})

const handleSwipeRight = () => router.push({ name: 'IndexPage' })

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

const updateVehicleList = (scope) => {
  pagination.value = scope.pagination
  setLocalStorage()
  getVehicleList.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getVehicleList.setParams({
    filter: filter.value ? filter.value : '',
    statusFilter: route.params.view ? route.params.view : '',
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    limit: pagination.value.rowsPerPage,
    skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
  })

  const subscription = getVehicleList.subscribe()
  const countSubscription = getVehicleList.subscribeCount()

  if (subscription.ready() && countSubscription.ready()) {
    vehicles.value = getVehicleList.fetch()
    pagination.value.rowsNumber = getVehicleList.getCount()
    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'VehicleList') {
    if (route.params.view && !availableViews.includes(route.params.view.toString())) {
      router.replace({ name: 'VehicleList' })
      return
    }

    getVehicleList.unsubscribeCount()
    vueDependency.changed()
  }
}, { immediate: true })

onUnmounted(() => {
  getVehicleList.unsubscribeCount()
  tracker.stop()
})

onMounted(() => {
  if ($q.localStorage.has('vehicleListPagination')) {
    const localStoragePagination = $q.localStorage.getItem('vehicleListPagination')

    pagination.value.sortBy = localStoragePagination.sortBy
    pagination.value.descending = localStoragePagination.descending
    pagination.value.rowsPerPage = localStoragePagination.rowsPerPage

    getVehicleList.unsubscribeCount()
    vueDependency.changed()
  } else {
    setLocalStorage()
  }
})

useMeta(() => ({
  title: title.value
}))
</script>

<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' padding>
    <transition name='fade' mode='out-in'>
      <q-table
        v-model:pagination='pagination'
        @request='updateVehicleList'
        :rows='vehicles'
        :columns='columns'
        :loading='isLoading'
        :filter='filter'
        :rows-per-page-options='[10,20,30,50]'
        :hide-header='vehicles.length < 1'
        :key='route.params.view'
        row-key='_id'
        id='vehicles-table'
        binary-state-sort
        bordered
        flat
      >
        <template #top-left>
          <div class='text-h4 text-bold'>{{ title }}</div>
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
        <template #bottom-row>
          <q-tr v-if='vehicles.length > 0 && !route.params.view'>
            <q-td class='gt-xs' />
            <q-td colspan='100%'>
              <q-btn
                @click='insertVehicleDialogRef.show()'
                :label='`${$t("vehicles.add_new")}...`'
                color='primary'
                padding='none'
                size='12px'
                flat
                no-caps
              />
            </q-td>
          </q-tr>
        </template>
        <template #no-data>
          <div class='row items-center q-col-gutter-sm'>
            <q-icon name='sym_o_warning' size='24px' color='secondary' />
            <span class='text-caption'>
              <template v-if='route.params.view && route.params.view === "deactivated"'>
                {{ $t('vehicles.msg_no_deactivated') }}
              </template>
              <template v-else>
                <div class='row'>
                  <span>{{ $t('vehicles.msg_no_data') }} </span>
                  <q-btn
                    @click='insertVehicleDialogRef.show()'
                    :label='`${$t("vehicles.add_new")}...`'
                    color='primary'
                    padding='none'
                    class='q-ml-xs'
                    size='12px'
                    flat
                    no-caps
                  />
                </div>
              </template>
            </span>
          </div>
        </template>
        <template #header-cell='props'>
          <q-th :props='props' :class='props.col.classes'>
            {{ props.col.label ? $t(props.col.label) : '' }}
          </q-th>
        </template>
        <template #header-cell-type='props'>
          <q-th :props='props' :class='props.col.classes' class='gt-xs'>
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
          <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' class='gt-xs' auto-width>
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
              v-if='props.value'
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
          </q-td>
        </template>
        <template #body-cell-operations='props'>
          <q-td :props='props' auto-width>
            <div class='q-gutter-sm'>
              <template v-if='props.row.isActive'>
                <q-btn
                  @click='updateVehicleDialogRef.show({
                    vehicleId: props.row._id,
                    vehicleCode: props.row.code
                  })'
                  icon='sym_o_edit'
                  color='secondary'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='deactivateVehicle({ vehicleId: props.row._id })'
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
                  @click='activateVehicle({ vehicleId: props.row._id })'
                  icon='sym_o_visibility'
                  color='positive'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='removeVehicle({ vehicleId: props.row._id })'
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
    </transition>
    <vehicle-form-dialog type='update' ref='updateVehicleDialogRef' />
  </q-page>
</template>

<style scoped>
#vehicles-table .search-vehicles {
  width: 300px;
}

#vehicles-table .search-vehicles.small {
  width: 120px;
}

#vehicles-table .q-chip {
  margin: 0 4px 0 0;
  font-size: 12px;
}
</style>
