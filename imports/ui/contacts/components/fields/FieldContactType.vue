<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactAPI, useContactFunctions } from '../../composables'

const model = defineModel({ required: true })
const { t: $t } = useI18n()
const { ContactTypesEnum } = useContactAPI()
const { isCompany } = useContactFunctions()
</script>

<template>
  <q-field class='contact-type q-mt-none' bottom-slots outlined>
    <q-radio
      v-for='type in ContactTypesEnum'
      v-model='model'
      :label='isCompany({ type }) ? $t("contacts.company") : $t("contacts.individual")'
      :val='type'
      :key='type'
      class='text-black q-pr-sm'
    />
  </q-field>
</template>
