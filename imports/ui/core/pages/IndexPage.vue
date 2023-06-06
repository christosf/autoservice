<template>
    <q-page padding>
        
    </q-page>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { useMeta } from '../../quasar'

export default {
    setup() {
        const { t: $t } = useI18n()

        useMeta({
            title: $t('core.homepage')
        })
    }
}
</script>
