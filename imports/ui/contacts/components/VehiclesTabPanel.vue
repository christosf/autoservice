<template>
  <div>
    <q-table
      @touchstart.stop
      @mousedown.stop
      :rows='vehicles'
      :columns='columns'
      :rows-per-page-options='[10,20,30,50]'
      row-key='_id'
      column-sort-order='da'
      ref='tableRef'
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
          <router-link
            :to='{ name: "ViewVehicle", params: { code: props.row.code }}'
            class='text-black'
          >
            {{ props.value }}
          </router-link>
        </q-td>
      </template>
      <template #body-cell-type='props'>
        <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' auto-width>
          <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}'>
            <q-icon name='sym_o_directions_car' color='secondary' size='22px' />
          </router-link>
        </q-td>
      </template>
      <template #body-cell-model='props'>
        <q-td :props='props'>
          <router-link
            :to='{ name: "ViewVehicle", params: { code: props.row.code }}'
            class='text-black'
          >
            {{ props.value }}
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
        <q-tr v-if='isContactActive'>
          <q-td colspan='8'>
            <q-btn
              @click='addVehicle'
              :label='$t("vehicles.add_new_vehicle")'
              icon='sym_o_add'
              color='primary'
              padding='xs sm'
              outline
              no-caps
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <edit-vehicle-dialog ref='editDialogRef' />
  </div>
</template>

<script>
import { ref, toRefs, computed, inject, onMounted } from 'vue'
import { date } from '../../quasar'
import { useVehicleFunctions } from '../../vehicles/composables'
import EditVehicleDialog from '../../vehicles/components/EditVehicleDialog.vue'

export default {
  components: {
    EditVehicleDialog
  },
  props: {
    contact: Object
  },
  setup(props) {
    const { contact } = toRefs(props)
    const { formatDate } = date

    const { deactivateVehicle } = useVehicleFunctions()

    const tableRef = ref(null)
    const editDialogRef = ref(null)
    const addVehicleDialogRef = inject('addVehicleDialogRef')

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
        format: (v) => formatDate(v, 'DD.MM.YYYY - HH:mm'),
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

    const vehicles = computed(() => contact.value.vehicles)

    const isContactActive = computed(() => contact.value.isActive)

    const addVehicle = () => {
      addVehicleDialogRef.value.open({
        _id: contact.value._id,
        code: contact.value.code,
        name: contact.value.name,
        phoneNumber: contact.value.phoneNumber
      })
    }

    onMounted(() => {
      tableRef.value.sort('updatedAt')
    })

    return {
      tableRef,
      editDialogRef,
      vehicles,
      isContactActive,
      columns,
      deactivateVehicle,
      addVehicle
    }
  }
}
</script>
