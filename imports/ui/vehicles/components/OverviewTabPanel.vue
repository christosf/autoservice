<template>
  <div class='row q-col-gutter-sm'>
    <div class='col-xs-12 col-sm-12 col-md-7'>
      <div class='q-gutter-sm'>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('vehicles.identification') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item v-if='vehicle.regNumber' class='q-py-md'>
                <q-item-section avatar>
                  <q-icon name='pin' color='primary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ vehicle.regNumber }}</q-item-label>
                  <q-item-label caption>{{ $t('vehicles.reg_number') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if='vehicle.chassisNumber' class='q-py-md'>
                <q-item-section avatar>
                  <q-icon name='tag' color='primary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ vehicle.chassisNumber }}</q-item-label>
                  <q-item-label caption>{{ $t('vehicles.chassis_number') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('vehicles.owner') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-item
              :to='{ name: "ViewContact", params: { code: vehicle.owner.code }}'
              class='q-py-md'
              clickable
            >
              <q-item-section avatar>
                <q-icon name='person' color='primary' />
              </q-item-section>
              <q-item-section>
                <q-item-label class='text-body1 text-secondary'>
                  {{ vehicle.owner.name }}
                </q-item-label>
                <q-item-label class='text-body2 text-grey-6 q-pt-xs'>
                  {{ vehicle.owner.phoneNumber }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
        <notes-card :id='vehicle._id' :notes='vehicle.notes' type='vehicles' />
      </div>
    </div>
    <div class='col-xs-12 col-sm-12 col-md-5'>
      <div class='q-gutter-sm'>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('core.tags') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <template v-if='vehicle.tags && vehicle.tags.length > 0'>
              <q-chip
                v-for='tag in vehicle.tags'
                :key='tag'
                class='q-ml-none'
                square
              >
                {{ tag }}
              </q-chip>
            </template>
            <span v-else class='text-italic text-grey'>{{ $t('core.none_1') }}</span>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('vehicles.details') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <template v-for='field in detailFields'>
                <q-item v-if='field.value' :key='field.value'>
                  <q-item-section avatar>
                    <q-icon :name='field.icon' color='secondary' />
                  </q-item-section>
                  <q-item-section class='text-body2'>
                    <q-item-label class='text-bold'>{{ field.label }}</q-item-label>
                    <q-item-label>{{ field.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import NotesCard from '../../core/components/NotesCard.vue'

export default {
  components: {
    NotesCard
  },
  props: {
    vehicle: Object
  },
  setup(props) {
    const { t: $t } = useI18n()
    const { vehicle } = toRefs(props)

    const detailFields = computed(() => [
      {
        label: $t('vehicles.make'),
        value: vehicle.value.make,
        icon: 'factory'
      },
      {
        label: $t('vehicles.model'),
        value: vehicle.value.model,
        icon: 'directions_car'
      },
      {
        label: $t('vehicles.model_year'),
        value: vehicle.value.modelYear,
        icon: 'calendar_month'
      },
      {
        label: $t('vehicles.body_type'),
        value: vehicle.value.bodyType,
        icon: 'commute'
      },
      {
        label: $t('vehicles.fuel_type'),
        value: vehicle.value.fuelType,
        icon: 'oil_barrel'
      },
      {
        label: $t('vehicles.drivetrain'),
        value: vehicle.value.drivetrain,
        icon: 'support'
      },
      {
        label: $t('vehicles.gearbox'),
        value: vehicle.value.gearbox,
        icon: 'settings'
      },
      {
        label: $t('vehicles.engine'),
        value: vehicle.value.engine,
        icon: 'cyclone'
      }
    ])

    return {
      vehicle,
      detailFields
    }
  }
}
</script>
