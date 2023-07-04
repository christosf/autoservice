<template>
    <q-page class='flex flex-center' padding>
        <q-card id='login-form' bordered flat>
            <q-card-section class='text-h4 text-bold'>
                {{ $t('users.login') }}
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-form @submit='submitForm' ref='formRef' class='q-gutter-md'>
                    <q-input
                        v-model='form.username'
                        @update:model-value='resetFormValidation'
                        :label='$t("users.username")'
                        :error='usernameHasError'
                        :error-message='$t("users.incorrect_credentials")'
                        :rules='rules.username'
                        lazy-rules='ondemand'
                        ref='usernameRef'
                        bottom-slots
                        autofocus
                        outlined
                    >
                        <template v-slot:prepend>
                            <q-icon name='person' />
                        </template>
                    </q-input>
                    <q-input
                        v-model='form.password'
                        @update:model-value='resetFormValidation'
                        :label='$t("users.password")'
                        :error='passwordHasError'
                        :rules='rules.password'
                        lazy-rules='ondemand'
                        type='password'
                        bottom-slots
                        outlined
                    >
                        <template v-slot:prepend>
                            <q-icon name='key' />
                        </template>
                    </q-input>
                    <q-btn
                        :label='$t("users.login")'
                        type='submit'
                        color='primary'
                        icon='login'
                        no-caps
                    />
                </q-form>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { ref, reactive, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useUsersAPI } from '../composables'
import { useErrorLogAPI } from '../../error-log/composables'

export default {
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const { t: $t } = useI18n()
        const { login } = useUsersAPI()
        const { insertErrorLog } = useErrorLogAPI()

        const usernameRef = ref(null)
        const formRef = ref(null)
        const form = reactive({
            username: '',
            password: ''
        })
        const usernameHasError = ref(false)
        const passwordHasError = ref(false)
        
        const rules = {
            username: [
                val => !!val || $t('core.field_required')
            ],
            password: [
                val => !!val || $t('core.field_required')
            ]
        }

        const submitForm = () => {
            const credentials = toRaw(form)

            login(credentials).then(() => {
                router.push({ name: 'IndexPage' })
                $q.notify({
                    type: 'positive',
                    message: $t('users.login_successful')
                })
            }).catch(error => {
                if (error.error === 403) {
                    usernameRef.value.focus()
                    usernameHasError.value = true
                    passwordHasError.value = true
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                    insertErrorLog({
                        location: 'LoginForm',
                        path: router.currentRoute.value.fullPath,
                        metadata: error
                    })
                }
            })
        }

        const resetFormValidation = () => {
            formRef.value.resetValidation()
            usernameHasError.value = false
            passwordHasError.value = false
        }

        useMeta({
            title: $t('users.login')
        })

        return {
            usernameRef,
            formRef,
            form,
            usernameHasError,
            passwordHasError,
            rules,
            submitForm,
            resetFormValidation
        }
    }
}
</script>

<style scoped>

#login-form {
    width: 100%;
    max-width: 500px;
}

</style>