<script setup>
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldPostCode: {
    type: String,
    required: true
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { optionalIfEmpty } = useCoreRules()

const rules = [
  (value) => optionalIfEmpty({ value, field: props.fieldPostCode, msg: $t('core.msg_field_required_short') })
]
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("core.address_city")'
    :rules='rules'
    lazy-rules='ondemand'
    maxlength='30'
    bottom-slots
    outlined
  >
    <template v-if='$q.screen.gt.xs' #prepend>
      <q-icon name='sym_o_location_city' />
    </template>
  </q-input>
</template>
