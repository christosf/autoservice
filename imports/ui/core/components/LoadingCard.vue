<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  message: String
})
</script>

<template>
  <q-card class='loading-card' bordered flat>
    <q-inner-loading :showing='props.loading'>
      <q-spinner-ball size='50px' color='primary' />
      <div v-if='props.message' class='text-h6 q-mt-md'>{{ props.message }}</div>
    </q-inner-loading>
  </q-card>
</template>

<style scoped>
.q-card.loading-card {
  height: 300px;
}
</style>
