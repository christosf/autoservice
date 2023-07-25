<template>
  <q-page class='flex flex-center' padding>
    <q-card id='login-form' bordered flat>
      <q-card-section class='text-h4 text-bold'>
        {{ $t('users.login') }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form ref='formRef' class='q-gutter-md'>

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
import { useCoreRules } from '../../core/composables'

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { t: $t } = useI18n()
    const { login } = useUsersAPI()
    const { insertErrorLog } = useErrorLogAPI()
    const { required } = useCoreRules()

    const formRef = ref(null)
    const passwordFieldRef = ref(null)

    const isFormSubmitted = ref(false)
    const isPasswordHidden = ref(true)
    const usernameHasError = ref(false)
    const passwordHasError = ref(false)

    const form = reactive({
      username: '',
      password: ''
    })

    const rules = {
      username: [
        (v) => required(v, $t('core.field_required'))
      ],
      password: [
        (v) => required(v, $t('core.field_required'))
      ]
    }

    const submitForm = async() => {
      isFormSubmitted.value = true
      const isValid = await formRef.value.validate()

      if (isValid) {
        const credentials = toRaw(form)

        login(credentials).then(() => {
          $q.notify({
            type: 'positive',
            message: $t('users.login_successful')
          })
          router.push({ name: 'IndexPage' })
        }).catch((error) => {
          if (error.error === 403) {
            usernameHasError.value = true
            passwordHasError.value = true
            passwordFieldRef.value.focus()
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
          isFormSubmitted.value = false
        })
      } else {
        isFormSubmitted.value = false
      }
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
      formRef,
      passwordFieldRef,
      isFormSubmitted,
      isPasswordHidden,
      usernameHasError,
      passwordHasError,
      form,
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
