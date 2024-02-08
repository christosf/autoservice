<script setup>
import { defineModel } from 'vue'
import { useCoreFunctions } from '../../../core/composables'

const model = defineModel({ required: true })
const { openNewTab } = useCoreFunctions()
</script>

<template>
  <q-select
    v-model='model'
    hide-dropdown-icon
    bottom-slots
    label-slot
    readonly
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_person' />
    </template>
    <template #label>
      <span>{{ $t('vehicles.owner') }}</span>
      <span class='text-red-8 q-pl-xs'>*</span>
    </template>
    <template #selected-item='{ opt }'>
      <span>{{ opt.name }}</span>
      <q-chip
        @click='openNewTab({ name: "ViewContact", params: { code: opt.code } })'
        size='sm'
        icon='sym_o_tag'
        class='q-ma-none q-ml-xs'
        clickable
        square
      >
        {{ opt.code }}
      </q-chip>
    </template>
  </q-select>
</template>
