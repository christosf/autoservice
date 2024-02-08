<script setup>
import { toRefs } from 'vue'

const definedProps = defineProps({
  props: {
    type: Object,
    required: true
  }
})

const { props } = toRefs(definedProps)
</script>

<template>
  <q-td :props='props' auto-width>
    <a :href='`tel:${props.value}`' class='text-black'>
      {{ props.value }}
    </a>
  </q-td>
</template>
