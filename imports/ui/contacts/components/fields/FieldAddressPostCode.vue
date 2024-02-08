<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldStreet: {
    type: String,
    required: true
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { minLength, optionalIfEmpty } = useCoreRules()

const rules = [
  (value) => optionalIfEmpty({ value, field: props.fieldStreet, msg: $t('core.msg_field_required_short') }),
  (value) => minLength({ value, length: 4, msg: $t('core.msg_field_minlength_short', { count: 4 }) })
]
</script>

<template>
  <q-input
    v-model='model'
    :label='$q.screen.lt.sm ? $t("core.address_post_code_short") : $t("core.address_post_code")'
    :rules='rules'
    lazy-rules='ondemand'
    maxlength='10'
    bottom-slots
    outlined
  >
    <template v-if='$q.screen.gt.xs' #prepend>
      <q-icon name='sym_o_signpost' />
    </template>
  </q-input>
</template>
