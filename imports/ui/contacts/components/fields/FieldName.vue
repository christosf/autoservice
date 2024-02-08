<script setup>
import { defineModel, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactFunctions, useContactRules } from '../../composables'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldType: {
    type: String,
    required: true
  },
  fieldPhoneNumber: {
    type: String,
    required: true
  },
  excludeId: String
})

const { t: $t } = useI18n()
const { isCompany } = useContactFunctions()
const { contactExists } = useContactRules()
const { required, minLength } = useCoreRules()

const fieldRef = ref(null)

const rules = [
  (value) => required({ value, msg: $t('core.msg_field_required') }),
  (value) => minLength({ value, length: 3, msg: $t('core.msg_field_minlength', { count: 3 }) }),
  (value) => contactExists({
    name: value,
    phoneNumber: props.fieldPhoneNumber,
    excludeId: props.excludeId,
    msg: $t('contacts.msg_already_exists')
  })
]

const label = computed(() => (
  isCompany({ type: props.fieldType }) ? $t('contacts.company_name') : $t('contacts.full_name')
))

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
    :rules='rules'
    lazy-rules='ondemand'
    ref='fieldRef'
    maxlength='60'
    bottom-slots
    label-slot
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_badge' />
    </template>
    <template #label>
      <span>{{ label }}</span>
      <span class='text-red-8 q-pl-xs'>{{ $t('core.asterisk') }}</span>
    </template>
  </q-input>
</template>
