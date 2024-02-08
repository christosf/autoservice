<script setup>
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

const definedProps = defineProps({
  props: {
    type: Object,
    required: true
  }
})

const { props } = toRefs(definedProps)
const { t: $t } = useI18n()
</script>

<template>
  <q-th :props='props' :class='props.col.classes'>
    {{ props.col.label ? $t(props.col.label) : '' }}
  </q-th>
</template>
