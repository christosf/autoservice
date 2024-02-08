<script setup>
import { inject } from 'vue'

const user = inject('user')

</script>

<template>
  <q-page padding>
    <pre>{{ user }}</pre>
  </q-page>
</template>
