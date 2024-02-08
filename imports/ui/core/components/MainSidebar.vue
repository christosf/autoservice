<script setup>
import ContactMenuItems from '../../contacts/components/MainMenuItems.vue'
import VehicleMenuItems from '../../vehicles/components/MainMenuItems.vue'
import JobCardMenuItems from '../../job_cards/components/MainMenuItems.vue'
</script>

<template>
  <q-list separator>
    <q-item :to='{ name: "IndexPage" }'>
      <q-item-section avatar>
        <q-icon name='sym_o_dashboard' />
      </q-item-section>
      <q-item-section>
        {{ $t('core.dashboard' )}}
      </q-item-section>
    </q-item>
    <contact-menu-items />
    <vehicle-menu-items />
    <job-card-menu-items />
  </q-list>
</template>

<style>
.q-list .sub-menu .q-item {
  padding-left: 56px;
  font-size: 13px;
}
</style>
