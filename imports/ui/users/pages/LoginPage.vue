<script setup>
import { ref, reactive, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useUserAPI } from '../composables'
import { useCoreRules, useCoreFunctions } from '../../core/composables'

const $q = useQuasar()
const router = useRouter()
const { t: $t } = useI18n()
const { userId, login } = useUserAPI()
const { required } = useCoreRules()
const { notifySuccess, notifyError } = useCoreFunctions()

const formRef = ref(null)
const usernameFieldRef = ref(null)
const passwordFieldRef = ref(null)

const isFormSubmitted = ref(false)
const isPasswordHidden = ref(true)
const isSubmitBtnDisabled = ref(false)
const usernameHasError = ref(false)
const passwordHasError = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    (value) => required({ value, msg: $t('core.msg_field_required') })
  ],
  password: [
    (value) => required({ value, msg: $t('core.msg_field_required') })
  ]
}

const resetFormValidation = () => {
  usernameHasError.value = false
  passwordHasError.value = false
  formRef.value.resetValidation()
}

const submitForm = async() => {
  if (isFormSubmitted.value || isSubmitBtnDisabled.value) {
    return
  }
  isFormSubmitted.value = true

  const isFormValid = await formRef.value.validate()

  if (isFormValid) {
    const credentials = toRaw(form)

    try {
      await login(credentials)

      notifySuccess($t('users.msg_login_successful'))
      router.push({ name: 'IndexPage' })
    } catch (error) {
      if (error.error === 403) {
        usernameHasError.value = true
        passwordHasError.value = true
        passwordFieldRef.value.focus()
      } else if (error.error === 'too-many-requests') {
        isSubmitBtnDisabled.value = true
        setTimeout(() => {
          isSubmitBtnDisabled.value = false
        }, error.details.timeToReset)
      } else {
        notifyError()
      }
    }
  }

  isFormSubmitted.value = false
}

useMeta({
  title: $t('users.login')
})
</script>

<template>
  <q-page :class='{"flex flex-center": $q.screen.gt.xs}' padding>
    <q-card v-if='!userId' id='login-form' class='full-width' bordered flat>
      <q-card-section class='text-h4 text-bold border-bottom'>
        {{ $t('users.login') }}
      </q-card-section>
      <q-card-section>
        <q-form ref='formRef' class='q-gutter-lg'>
          <q-input
            v-model='form.username'
            @update:model-value='resetFormValidation'
            @keyup.enter='submitForm'
            :label='$t("users.username")'
            :error='usernameHasError'
            :rules='rules.username'
            lazy-rules='ondemand'
            ref='usernameFieldRef'
            autocomplete='username'
            bottom-slots
            autofocus
            outlined
          >
            <template #prepend>
              <q-icon name='sym_o_person' />
            </template>
          </q-input>
          <q-input
            v-model='form.password'
            @update:model-value='resetFormValidation'
            @keyup.enter='submitForm'
            :type='isPasswordHidden ? "password" : "text"'
            :label='$t("users.password")'
            :error='passwordHasError'
            :rules='rules.password'
            lazy-rules='ondemand'
            ref='passwordFieldRef'
            autocomplete='current-password'
            bottom-slots
            outlined
          >
            <template #prepend>
              <q-icon name='sym_o_key' />
            </template>
            <template #append>
              <q-icon
                @mousedown='isPasswordHidden = false'
                @mouseup='isPasswordHidden = true'
                :name='isPasswordHidden ? "sym_o_visibility" : "sym_o_visibility_off"'
                class='cursor-pointer'
              />
            </template>
            <template #error>
              <span v-if='passwordHasError'>
                {{ $q.screen.lt.sm
                    ? $t('users.msg_incorrect_credentials_short')
                    : $t('users.msg_incorrect_credentials')
                }}
              </span>
              <span v-else>{{ passwordFieldRef.errorMessage }}</span>
            </template>
          </q-input>
          <q-btn
            @click='submitForm'
            :label='$t("users.login")'
            :loading='isFormSubmitted'
            :disable='isSubmitBtnDisabled'
            color='primary'
            icon='sym_o_login'
            no-caps
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
#login-form {
  max-width: 600px;
}
</style>
