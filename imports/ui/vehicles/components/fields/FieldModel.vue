<script setup>
import { defineModel, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleAPI } from '../../composables'
import { useCoreRules } from '../../../core/composables'

const model = defineModel({ required: true })
const props = defineProps({
  fieldMake: {
    type: String,
    required: true
  }
})

const { t: $t } = useI18n()
const { required } = useCoreRules()
const { getDistinctFieldValues } = useVehicleAPI()

const optionList = ref([])

const rules = [
  (value) => required({ value, msg: $t('core.msg_field_required') })
]

const filterOptionList = async(filter, update) => {
  const options = await getDistinctFieldValues({
    filter,
    field: 'model',
    basedOn: props.fieldMake ? props.fieldMake : ''
  })

  update(() => {
    optionList.value = options
  })
}

watchEffect(() => {
  optionList.value = optionList.value.filter((v) => !model.value.includes(v))
})
</script>

<template>
  <q-select
    v-model='model'
    @input-value='(value) => model = value'
    @filter='filterOptionList'
    :rules='rules'
    :options='optionList'
    :disable='fieldMake.length === 0'
    lazy-rules='ondemand'
    maxlength='50'
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
      <q-icon name='sym_o_directions_car' />
    </template>
    <template #label>
      <span>{{ $t('vehicles.model') }}</span>
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
