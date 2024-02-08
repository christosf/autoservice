<script setup>
import { defineModel } from 'vue'

const model = defineModel({ required: true })
</script>

<template>
  <q-select v-model='model' :label='$t("job_cards.assigned_to")' disable bottom-slots outlined>
    <template #prepend>
      <q-icon name='sym_o_assignment_ind' />
    </template>
  </q-select>
</template>
