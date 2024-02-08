<script setup>
import { toRefs } from 'vue'

const definedProps = defineProps({
  props: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['filter'])
const { props } = toRefs(definedProps)
</script>

<template>
  <q-td :props='props'>
    <router-link
      :to='{ name: "ViewContact", params: { code: props.row.code }}'
      class='text-black q-mr-xs'
    >
      {{ props.value }}
    </router-link>
    <q-chip
      v-for='tag in props.row.tags'
      @click='emit("filter", tag)'
      :label='tag'
      :key='tag'
      class='text-weight-medium q-ma-none q-mr-xs'
      size='12px'
      clickable
      square
      dense
    />
  </q-td>
</template>
