<script setup>
import { defineModel, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleAPI } from '../../composables'

const model = defineModel({ required: true })

const { t: $t } = useI18n()
const { getDistinctFieldValues } = useVehicleAPI()

const optionList = ref([])

const filterOptionList = async(filter, update) => {
  const options = await getDistinctFieldValues({ filter, field: 'fuelType' })

  update(() => {
    optionList.value = options
  })
}
</script>

<template>
  <q-select
    v-model='model'
    @filter='filterOptionList'
    @input-value='(value) => model = value'
    :label='$t("vehicles.fuel_type")'
    :options='optionList'
    maxlength='50'
    hide-dropdown-icon
    use-input
    fill-input
    hide-selected
    options-dense
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_oil_barrel' />
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
