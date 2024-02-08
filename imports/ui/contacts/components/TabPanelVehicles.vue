<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, inject, onUnmounted } from 'vue'
import { useQuasar } from '../../quasar'
import { useCoreFunctions } from '../../core/composables'
import { useVehicleAPI, useVehicleFunctions } from '../../vehicles/composables'
import VehicleFormDialog from '../../vehicles/components/VehicleFormDialog.vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})

const $q = useQuasar()
const { localizedFormat } = useCoreFunctions()
const { getVehicleListByOwnerQuery } = useVehicleAPI()
const { deactivateVehicle } = useVehicleFunctions()

const vueDependency = new Tracker.Dependency()
const getVehicleListByOwner = getVehicleListByOwnerQuery.clone()
const insertVehicleDialogRef = inject('insertVehicleDialogRef')
const updateVehicleDialogRef = ref(null)
const isLoading = ref(false)
const vehicles = ref([])

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
    align: 'center'
  },
  {
    name: 'regNumber',
    field: 'regNumber',
    label: 'vehicles.reg_number_short',
    sortable: true,
    align: 'left'
  },
  {
    name: 'make',
    field: 'make',
    label: 'vehicles.make',
    sortable: true,
    align: 'left'
  },
  {
    name: 'model',
    field: 'model',
    label: 'vehicles.model',
    sortable: true,
    align: 'left'
  },
  {
    name: 'tags',
    field: 'tags',
    label: 'core.tags',
    align: 'left'
  },
  {
    name: 'updatedAt',
    field: 'updatedAt',
    label: 'core.updated_at_short',
    format: (v) => localizedFormat({ date: v, format: 'dd.MM.yyyy - HH:mm' }),
    sortable: true,
    align: 'left'
  },
  {
    name: 'code',
    field: 'code',
    label: 'core.code',
    sortable: true,
    align: 'left'
  },
  {
    name: 'operations',
    classes: 'operations',
    align: 'right'
  }
]

const insertVehicle = () => {
  insertVehicleDialogRef.value.show({
    owner: {
      _id: props.contact._id,
      code: props.contact.code,
      name: props.contact.name,
      phoneNumber: props.contact.phoneNumber
    }
  })
}

const updateVehicleList = (scope) => {
  pagination.value = scope.pagination
  getVehicleListByOwner.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getVehicleListByOwner.setParams({
    ownerId: props.contact._id,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    limit: pagination.value.rowsPerPage,
    skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
  })

  const subscription = getVehicleListByOwner.subscribe()
  const countSubscription = getVehicleListByOwner.subscribeCount()

  if (subscription.ready() && countSubscription.ready()) {
    vehicles.value = getVehicleListByOwner.fetch()
    pagination.value.rowsNumber = getVehicleListByOwner.getCount()
    isLoading.value = false
  }
})

onUnmounted(() => {
  getVehicleListByOwner.unsubscribeCount()
  tracker.stop()
})

</script>

<template>
  <q-table
    v-model:pagination='pagination'
    @request='updateVehicleList'
    @touchstart.stop
    @mousedown.stop
    :rows='vehicles'
    :columns='columns'
    :loading='isLoading'
    :rows-per-page-options='[10,20,30,50]'
    :hide-header='vehicles.length < 1'
    row-key='_id'
    id='vehicles-table'
    binary-state-sort
    bordered
    flat
  >
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
    <template #body-cell-tags='props'>
      <q-td :props='props'>
        <template v-if='props.value.length > 0'>
          <q-chip
            v-for='tag in props.value'
            :label='tag'
            :key='tag'
            size='12px'
            class='q-ml-none'
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
        </div>
      </q-td>
    </template>
    <template #bottom-row>
      <q-tr v-if='props.contact.isActive && vehicles.length > 0'>
        <q-td style='height: 38px;' />
        <q-td colspan='100%' style='height: 38px;'>
          <q-btn
            @click='insertVehicle'
            :label='`${$t("vehicles.add_new")}...`'
            color='primary'
            padding='none'
            style='font-size: 12px;'
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
            <div class='row'>
              <span>{{ $t('vehicles.msg_no_data') }} </span>
              <q-btn
                @click='insertVehicle'
                :label='`${$t("vehicles.add_new")}...`'
                color='primary'
                padding='none'
                class='q-ml-xs'
                style='font-size: 12px;'
                flat
                no-caps
              />
            </div>
        </span>
      </div>
    </template>
  </q-table>
  <vehicle-form-dialog type='update' ref='updateVehicleDialogRef' />
</template>
