<script setup>
import { useI18n } from 'vue-i18n'
import { useMeta } from '../../quasar'

const { t: $t } = useI18n()

useMeta({
  title: $t('core.dashboard')
})

</script>

<template>
  <q-page padding>
    {{ $t('core.msg_welcome') }}
  </q-page>
</template>
