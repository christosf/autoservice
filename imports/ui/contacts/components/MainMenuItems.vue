<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t: $t } = useI18n()
</script>

<template>
  <q-expansion-item
    :model-value='route.meta.group === "Contacts"'
    :header-class='{"q-router-link--active": route.meta.group === "Contacts"}'
    :to='{ name: "ContactList" }'
    :label='$t("contacts.many")'
    icon='sym_o_group'
  >
    <q-list class='sub-menu q-mb-sm' dense>
      <q-item :to='{ name: "ContactList", params: { view: "customers" }}'>
        <q-item-section>
          <q-item-label>{{ $t('contacts.customers') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item :to='{ name: "ContactList", params: { view: "suppliers" }}' disable>
        <q-item-section>
          <q-item-label>{{ $t('contacts.suppliers') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item :to='{ name: "ContactList", params: { view: "deactivated" }}'>
        <q-item-section>
          <q-item-label>{{ $t('contacts.deactivated') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>
