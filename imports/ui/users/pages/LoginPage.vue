<template>
    <q-page class='flex flex-center' padding>
        <q-card class='login-form' bordered flat>
            <q-card-section class='text-h6'>
                {{ $t('users.login') }}
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-form @submit='submitForm' ref='formRef' class='q-gutter-md'>
                    <q-input
                        v-model='form.username'
                        @update:model-value='resetValidation'
                        :label='$t("users.username")'
                        :error='usernameFieldHasError'
                        :error-message='$t("users.incorrect_credentials")'
                        :rules='rules.username'
                        lazy-rules='ondemand'
                        ref='usernameFieldRef'
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
                        @update:model-value='resetValidation'
                        :label='$t("users.password")'
                        :error='passwordFieldHasError'
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useUsers } from '../composables'

export default {
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const { t: $t } = useI18n()
        const { login } = useUsers()

        const usernameFieldRef = ref(null)
        const formRef = ref(null)
        const form = reactive({
            username: '',
            password: ''
        })
        const usernameFieldHasError = ref(false)
        const passwordFieldHasError = ref(false)
        
        const rules = {
            username: [
                val => !!val || $t('core.field_required')
            ],
            password: [
                val => !!val || $t('core.field_required')
            ]
        }

        const submitForm = () => {
            login(form).then(() => {
                router.push({ name: 'IndexPage' })
                $q.notify({
                    type: 'positive',
                    message: $t('users.login_successful')
                })
            }).catch(error => {
                if (error.error === 403) {
                    usernameFieldRef.value.focus()
                    usernameFieldHasError.value = true
                    passwordFieldHasError.value = true
                } else {
                    console.log(error)
                }
            })
        }

        const resetValidation = () => {
            formRef.value.resetValidation()
            usernameFieldHasError.value = false
            passwordFieldHasError.value = false
        }

        return {
            usernameFieldRef,
            formRef,
            form,
            usernameFieldHasError,
            passwordFieldHasError,
            rules,
            submitForm,
            resetValidation
        }
    }
}
</script>

<style>
.login-form {
    width: 100%;
    max-width: 500px;
}
</style>