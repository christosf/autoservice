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
    <router-link :to='{ name: "ViewContact", params: { code: props.row.code }}' class='text-black'>
      {{ props.value }}
    </router-link>
  </q-td>
</template>
