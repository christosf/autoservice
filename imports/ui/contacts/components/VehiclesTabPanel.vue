<template>
    <q-table
        @touchstart.stop
        @mousedown.stop
        :rows='vehicles'
        :columns='columns'
        :rows-per-page-options='[10,20,30,50]'
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
                <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}' class='text-black'>
                    {{ props.value }}
                </router-link>
            </q-td>
        </template>
        <template #body-cell-type='props'>
            <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' auto-width>
                <router-link :to='{ name: "ViewVehicle", params: { code: props.row.code }}'>
                    <q-icon name='directions_car' color='secondary' size='22px' />
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
        <template #body-cell-tags='props'>
            <q-td :props='props'>
                <q-chip
                    v-if='props.value.length > 0'
                    v-for='tag in props.value'
                    :label='tag'
                    square
                />
                <span v-else>-</span>
            </q-td>
        </template>
        <template #body-cell-operations='props'>
            <q-td :props='props' auto-width>
                
            </q-td>
        </template>
        <template #bottom-row>
            <q-tr>
                <q-td colspan='8'>
                    <q-btn
                        @click='addVehicle'
                        :label='$t("vehicles.add_new_vehicle")'
                        icon='add'
                        color='primary'
                        padding='xs sm'
                        outline
                        no-caps
                    />
                </q-td>
            </q-tr>
        </template>
    </q-table>
</template>

<script>
import { ref, toRefs, computed, inject, onMounted } from 'vue'
import { date } from '../../quasar'

export default {
    props: {
        contact: Object
    },
    setup(props) {
        const { contact } = toRefs(props)
        const { formatDate } = date
        
        const tableRef = ref(null)
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
                format: v =>  formatDate(v, 'DD.MM.YYYY - HH:mm'),
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
            },
        ]

        const vehicles = computed(() => contact.value.vehicles)

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
            vehicles,
            columns,
            addVehicle
        }
    }
}
</script>
