<script setup>
import { defineModel } from 'vue'

const model = defineModel({ required: true })
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("contacts.tax_reg_number")'
    maxlength='20'
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_tag' />
    </template>
  </q-input>
</template>
