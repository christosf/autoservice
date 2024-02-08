<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  labelPrevious: String,
  labelNext: String
})

const emit = defineEmits(['previous', 'next'])

const { t: $t } = useI18n()
</script>

<template>
  <q-btn-group outline>
    <q-btn
      @click='emit("previous")'
      color='secondary'
      icon='sym_o_chevron_left'
      padding='xs'
      size='13px'
      outline
    >
      <q-tooltip>{{ props.labelPrevious ? props.labelPrevious : $t('core.previous') }}</q-tooltip>
    </q-btn>
    <q-separator />
    <q-btn
      @click='emit("next")'
      color='secondary'
      icon='sym_o_chevron_right'
      padding='xs'
      size='13px'
      outline
    >
      <q-tooltip>{{ props.labelNext ? props.labelNext : $t('core.next') }}</q-tooltip>
    </q-btn>
  </q-btn-group>
</template>