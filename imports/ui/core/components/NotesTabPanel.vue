<template>
    <q-card bordered flat>
        <q-card-section>
            <q-form @submit='submitForm' class='q-gutter-sm'>
                <q-editor
                    v-model='notesField'
                    :toolbar='editorToolbar'
                    ref='notesFieldRef'
                    min-height='100px'
                />
                <div class='q-gutter-sm q-ml-none'>
                    <q-btn
                        :label='$t("core.save")'
                        :disabled='isButtonDisabled'
                        :loading='isFormSubmitted'
                        type='submit'
                        color='primary'
                        icon='save'
                        outline
                        no-caps
                    />
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script>
import { ref, toRefs, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useContactAPI } from '../../contacts/composables'

export default {
    props: {
        id: String,
        type: String,
        notes: String
    },
    setup(props) {
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { updateContactNotes } = useContactAPI()
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
                    response = await updateContactNotes({ _id: id.value, notes: notesField.value })
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
