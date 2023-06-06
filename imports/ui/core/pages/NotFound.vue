<template>
    <q-page padding>
        <q-card bordered flat>
            <q-card-section class='text-h6'>
                {{ $t('core.not_found_title') }}
            </q-card-section>
            <q-separator />
            <q-card-section>
                {{ $t('core.not_found_msg') }}
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { useMeta } from '../../quasar'

export default {
    setup() {
        const { t: $t } = useI18n()
        
        useMeta({
            title: $t('core.not_found_title')
        })
    }
}
</script>