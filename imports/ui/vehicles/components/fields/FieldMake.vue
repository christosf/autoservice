<script setup>
import { defineModel, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleAPI } from '../../composables'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })

const { t: $t } = useI18n()
const { required } = useCoreRules()
const { getDistinctFieldValues } = useVehicleAPI()

const fieldRef = ref(null)
const optionList = ref([])

const rules = [
  (value) => required({ value, msg: $t('core.msg_field_required') })
]

const filterOptionList = async(filter, update) => {
  const options = await getDistinctFieldValues({ filter, field: 'make' })

  update(() => {
    optionList.value = options
  })
}

const focus = () => {
  fieldRef.value.focus()
}

watchEffect(() => {
  optionList.value = optionList.value.filter((v) => !model.value.includes(v))
})

defineExpose({
  focus
})
</script>

<template>
  <q-select
    v-model='model'
    @input-value='(value) => model = value'
    @filter='filterOptionList'
    :rules='rules'
    :options='optionList'
    lazy-rules='ondemand'
    maxlength='50'
    ref='fieldRef'
    hide-dropdown-icon
    use-input
    fill-input
    hide-selected
    options-dense
    bottom-slots
    label-slot
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_commute' />
    </template>
    <template #label>
      <span>{{ $t('vehicles.make') }}</span>
      <span class='text-red-8 q-pl-xs'>*</span>
    </template>
    <template v-slot:option='{ itemProps, opt }'>
      <q-item v-bind='itemProps' class='add-relation-item'>
        <q-item-section>
          <q-item-label>{{ opt }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
