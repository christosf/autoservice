<script setup>
import { defineModel, ref, inject, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreFunctions, useCoreRules } from '../../../core/composables'
import { useVehicleAPI } from '../../../vehicles/composables'
import { useVehicleStore } from '../../../vehicles/store'

const model = defineModel({ required: true })

const $q = useQuasar()
const vehicleStore = useVehicleStore()
const { t: $t } = useI18n()
const { getFilteredVehicles } = useVehicleAPI()
const { openNewTab } = useCoreFunctions()
const { required } = useCoreRules()

const insertVehicleDialogRef = inject('insertVehicleDialogRef')
const fieldRef = ref(null)
const inputHasValue = ref(false)
const isLoading = ref(false)
const optionList = ref([])

const rules = [
  (value) => required({ value, msg: $t('core.msg_field_required') })
]

const optionListLabel = computed(() => (
  inputHasValue.value ? $t('core.msg_no_results') : $t('core.type_to_search')
))

const addNewVehicle = () => {
  insertVehicleDialogRef.value.show({ origin: 'insertJobCardDialog' })
  fieldRef.value.updateInputValue('')
  fieldRef.value.focus()
}

const filterOptionList = async(filter, update) => {
  isLoading.value = true
  if (filter === '') {
    update(() => {
      optionList.value = []
    })
    isLoading.value = false
    return
  }

  const contacts = await getFilteredVehicles({ filter })

  update(
    () => {
      optionList.value = contacts
      isLoading.value = false
    },
    (reference) => {
      if (reference.options.length === 1) {
        reference.setOptionIndex(0)
      }
    }
  )
}

vehicleStore.$onAction(({ name, after }) => {
  if (name === 'setProvidedVehicle') {
    after(() => {
      model.value = vehicleStore.providedVehicle
      vehicleStore.clearProvidedVehicle()

      nextTick(() => {
        insertVehicleDialogRef.value.hide()
        fieldRef.value.hidePopup()
      })
    })
  }
})
</script>

<template>
  <q-select
    v-model='model'
    @input-value='(value) => inputHasValue = (value !== "")'
    @filter='filterOptionList'
    :rules='rules'
    :options='optionList'
    :autofocus='$q.platform.is.desktop'
    ref='fieldRef'
    lazy-rules='ondemand'
    class='q-mt-none'
    tabindex='1'
    hide-dropdown-icon
    use-input
    clearable
    bottom-slots
    label-slot
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_commute' />
    </template>
    <template #label>
      <span>{{ $t('job_cards.vehicle') }}</span>
      <span class='text-red-8 q-pl-xs'>*</span>
    </template>
    <template v-slot:option='{ itemProps, opt }'>
      <q-item v-bind='itemProps' class='add-relation-item'>
        <q-item-section>
          <q-item-label>
            <span class='text-bold'>{{ opt.makeModel }}</span>
            <q-chip size='sm' icon='sym_o_tag' class='q-ma-none q-ml-xs' square>
              {{ opt.code }}
            </q-chip>
          </q-item-label>
          <q-item-label v-if='opt.regNumber' caption>{{ opt.regNumber }}</q-item-label>
          <q-item-label v-if='!opt.regNumber && opt.chassisNumber' caption>
            {{ opt.chassisNumber }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected-item='{ opt }'>
      <span v-if='opt.regNumber'>
        <span class='text-bold'>{{ opt.regNumber }}</span> - {{ opt.makeModel }}
      </span>
      <span v-if='!opt.regNumber && opt.chassisNumber'>
        {{ opt.makeModel }} - {{ opt.chassisNumber }}
      </span>
      <q-chip
        @click='openNewTab({ name: "ViewVehicle", params: { code: opt.code } })'
        size='sm'
        icon='sym_o_tag'
        class='q-ma-none q-ml-xs'
        clickable
        square
      >
        {{ opt.code }}
      </q-chip>
    </template>
    <template #no-option>
      <div class='after-options-slot'>
        <q-item class='add-relation-item' dense>
          <q-item-section>
            <q-item-label class='text-caption'>{{ optionListLabel }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item @click='addNewVehicle' class='add-relation-item' clickable dense>
          <q-item-section>
            <q-item-label class='text-caption text-primary'>
              {{ $t('vehicles.add_new_vehicle') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
    <template #after-options>
      <div class='after-options-slot'>
        <q-item @click='addNewVehicle' class='add-relation-item' clickable dense>
          <q-item-section>
            <q-item-label class='text-caption text-primary'>
              {{ $t('vehicles.add_new_vehicle') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
  </q-select>
</template>
