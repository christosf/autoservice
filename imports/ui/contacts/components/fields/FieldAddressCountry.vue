<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldCity: {
    type: String,
    required: true
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { minLength, optionalIfEmpty } = useCoreRules()

const rules = [
  (value) => optionalIfEmpty({ value, field: props.fieldCity, msg: $t('core.msg_field_required_short') }),
  (value) => minLength({ value, length: 2, msg: $t('core.msg_field_minlength_short', { count: 2 }) })
]
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("core.address_country")'
    :rules='rules'
    lazy-rules='ondemand'
    maxlength='30'
    bottom-slots
    outlined
  >
    <template v-if='$q.screen.gt.xs' #prepend>
      <q-icon name='sym_o_flag_circle' />
    </template>
  </q-input>
</template>
