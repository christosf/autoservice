<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ required: true })
const { t: $t } = useI18n()
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("vehicles.model_year")'
    mask='####'
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_calendar_month' />
    </template>
  </q-input>
</template>
