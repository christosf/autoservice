<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t: $t } = useI18n()
</script>

<template>
  <q-expansion-item
    :model-value='route.meta.group === "Vehicles"'
    :header-class='{"q-router-link--active": route.meta.group === "Vehicles"}'
    :to='{ name: "VehicleList" }'
    :label='$t("vehicles.many")'
    icon='sym_o_commute'
  >
    <q-list class='sub-menu q-mb-sm' dense>
      <q-item :to='{ name: "VehicleList", params: { view: "deactivated" }}'>
        <q-item-section>
          <q-item-label>{{ $t('vehicles.deactivated') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>
