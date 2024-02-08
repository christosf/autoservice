<script setup>
import { useI18n } from 'vue-i18n'
import { useMeta } from '../../quasar'

const { t: $t } = useI18n()

useMeta({
  title: $t('core.not_found')
})
</script>

<template>
  <q-page padding>{{ $t('core.not_found') }}</q-page>
</template>
