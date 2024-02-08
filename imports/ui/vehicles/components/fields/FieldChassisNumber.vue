<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleRules } from '../../composables'

const model = defineModel({ required: true })
const props = defineProps({
  hasError: Boolean,
  excludeId: {
    type: String,
    default: ''
  }
})

const { t: $t } = useI18n()
const { chassisNumber, fieldValueExists } = useVehicleRules()

const rules = [
  (value) => chassisNumber({ value, msg: $t('vehicles.msg_chassis_number_invalid') }),
  (value) => fieldValueExists({
    value,
    field: 'chassisNumber',
    msg: $t('vehicles.msg_chassis_number_exists'),
    excludeId: props.excludeId
  })
]
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("vehicles.chassis_number")'
    :rules='rules'
    :error='props.hasError'
    lazy-rules='ondemand'
    input-class='text-uppercase'
    maxlength='17'
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_tag' />
    </template>
  </q-input>
</template>
