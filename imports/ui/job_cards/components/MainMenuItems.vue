<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t: $t } = useI18n()
</script>

<template>
  <q-expansion-item
    :model-value='route.meta.group === "JobCards"'
    :header-class='{"q-router-link--active": route.meta.group === "JobCards"}'
    :to='{ name: "JobCardList" }'
    :label='$t("job_cards.many")'
    icon='sym_o_build_circle'
  >
    <q-list class='sub-menu q-mb-sm' dense>
      <q-item :to='{ name: "JobCardList", params: { view: "completed" }}'>
        <q-item-section>
          <q-item-label>{{ $t('job_cards.completed') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item :to='{ name: "JobCardList", params: { view: "canceled" }}'>
        <q-item-section>
          <q-item-label>{{ $t('job_cards.canceled') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>
