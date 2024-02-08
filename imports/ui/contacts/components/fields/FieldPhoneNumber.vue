<script setup>
import { defineModel, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoreFunctions, useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const { t: $t } = useI18n()
const { filterInputDigitsOnly } = useCoreFunctions()
const { required, phoneNumber } = useCoreRules()

const fieldRef = ref(null)

const rules = [
  (value) => required({ value, msg: $t('core.msg_field_required') }),
  (value) => phoneNumber({ value, msg: $t('contacts.msg_phone_number_invalid') })
]

const focus = () => {
  fieldRef.value.focus()
}

defineExpose({
  focus
})
</script>

<template>
  <q-input
    v-model='model'
    @keydown='filterInputDigitsOnly'
    :rules='rules'
    lazy-rules='ondemand'
    ref='fieldRef'
    maxlength='20'
    type='tel'
    bottom-slots
    label-slot
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_call' />
    </template>
    <template #label>
      <span>{{ $t('contacts.phone') }}</span>
      <span class='text-red-8 q-pl-xs'>{{ $t('core.asterisk') }}</span>
    </template>
  </q-input>
</template>
