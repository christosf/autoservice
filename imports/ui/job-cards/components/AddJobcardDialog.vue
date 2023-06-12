<template>
    <q-dialog
        v-model='dialogOpen'
        @hide='resetForm'
        :maximized='$q.platform.is.mobile'
        id='add-jobcard-dialog'
        no-backdrop-dismiss
    >
        <q-card>
            <q-card-section class='q-pa-sm'>
                <q-toolbar>
                    <div class='text-h6'>{{ $t('jobcards.add') }}</div>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section class='q-pa-none'>

            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'

export default {
    setup() {
        const $q = useQuasar()
        const { t: $t } = useI18n()

        const dialogOpen = ref(false)
        const formSubmitted = ref(false)
        const jobcardAdded = ref(null)

        const open = () => dialogOpen.value = true

        const resetForm = () => {

        }

        return {
            dialogOpen,
            formSubmitted,
            jobcardAdded,
            open,
            resetForm
        }
    }
}
</script>
