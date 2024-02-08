<script setup>
const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <q-card bordered flat>
    <q-card-section class='border-bottom'>
      Not yet available.
    </q-card-section>
    <q-card-section>
      <pre>{{ props.contact }}</pre>
    </q-card-section>
  </q-card>
</template>
