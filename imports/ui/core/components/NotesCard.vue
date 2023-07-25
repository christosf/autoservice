<template>
    <q-card class='notes-card' bordered flat>
        <q-card-section class='text-h6 text-bold'>
            {{ $t('core.notes') }}
        </q-card-section>
        <q-separator />
        <q-card-section class='q-pa-none'>
            <q-form @submit='submitForm'>
                <q-editor
                    v-model='notesField'
                    :toolbar='editorToolbar'
                    ref='notesFieldRef'
                    min-height='100px'
                    square
                    flat
                />
                <q-separator />
                <q-btn
                    :label='$t("core.save")'
                    :disabled='isButtonDisabled'
                    :loading='isFormSubmitted'
                    type='submit'
                    color='primary'
                    icon='sym_o_save'
                    class='q-ma-sm'
                    padding='xs sm'
                    outline
                    no-caps
                />
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script>
import { ref, toRefs, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useContactAPI } from '../../contacts/composables'
import { useVehicleAPI } from '../../vehicles/composables'

export default {
    props: {
        id: String,
        type: String,
        notes: String
    },
    setup(props) {
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { updateNotes: updateContactNotes } = useContactAPI()
        const { updateNotes: updateVehicleNotes } = useVehicleAPI()
        const { id, type, notes } = toRefs(props)

        const notesFieldRef = ref(null)
        const notesField = ref('')
        const isFormSubmitted = ref(false)

        const editorToolbar = [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike']
        ]

        const isButtonDisabled = computed(() => 
            (notesField.value && notesField.value.trim() === notes.value) ||
            (notesField.value === '' && !notes.value)
        )

        const submitForm = async () => {
            isFormSubmitted.value = true
            let response

            switch(type.value) {
                case 'contacts':
                    response = await updateContactNotes({
                        contactId: id.value,
                        notes: notesField.value
                    })
                    break
                case 'vehicles':
                    response = await updateVehicleNotes({ _id: id.value, notes: notesField.value })
                    break
                default:
                    console.log('No type specified in notes tab panel.')
                    return
            }
            const { updated } = response

            if (updated) {
                $q.notify({
                    type: 'positive',
                    message: $t('core.notes_update_successful')
                })
            } else {
                $q.notify({
                    type: 'negative',
                    message: $t('core.error_occured')
                })
            }
            isFormSubmitted.value = false
            notesFieldRef.value.focus()
        }

        watchEffect(() => notesField.value = notes.value ? notes.value : '')

        return {
            notesFieldRef,
            notesField,
            isFormSubmitted,
            editorToolbar,
            isButtonDisabled,
            submitForm
        }
    }
}
</script>

<style>
.notes-card .q-editor__toolbars-container {
    border-bottom: 1px solid rgba(0,0,0,0.1);
}
</style>
