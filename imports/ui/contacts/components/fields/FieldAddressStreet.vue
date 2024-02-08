<script setup>
import { defineModel, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  type: {
    type: String,
    default: 'billing'
  }
})

const $q = useQuasar()
const { t: $t } = useI18n()
const { minLength } = useCoreRules()

const fieldRef = ref(null)

const rules = [
  (value) => minLength({ value, length: 3, msg: $t('core.msg_field_minlength', { count: 3 }) })
]

const icon = computed(() => (props.type === 'billing' ? 'sym_o_contact_mail' : 'sym_o_local_shipping'))

const focus = () => fieldRef.value.focus()

defineExpose({
  focus
})
</script>

<template>
  <q-input
    v-model='model'
    :label='$t("core.address_street")'
    :rules='rules'
    lazy-rules='ondemand'
    ref='fieldRef'
    maxlength='50'
    bottom-slots
    outlined
  >
    <template v-if='$q.screen.gt.xs' #prepend>
      <q-icon :name='icon' />
    </template>
  </q-input>
</template>
