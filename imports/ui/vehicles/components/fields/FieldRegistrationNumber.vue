<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleRules } from '../../composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldChassisNumber: {
    type: String,
    required: true
  },
  excludeId: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['chassisFieldError'])

const { t: $t } = useI18n()
const { regNumber, fieldValueExists } = useVehicleRules()

const rules = [
  (value) => {
    if (!value && !props.fieldChassisNumber) {
      emit('chassisFieldError')
      return $t('vehicles.msg_reg_or_chassis_required')
    }
    return true
  },
  (value) => regNumber({ value, msg: $t('vehicles.msg_reg_number_invalid') }),
  (value) => fieldValueExists({
    value,
    field: 'regNumber',
    msg: $t('vehicles.msg_reg_number_exists'),
    excludeId: props.excludeId
  })
]
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("vehicles.reg_number")'
    :rules='rules'
    lazy-rules='ondemand'
    input-class='text-uppercase'
    maxlength='10'
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_pin' />
    </template>
  </q-input>
</template>
