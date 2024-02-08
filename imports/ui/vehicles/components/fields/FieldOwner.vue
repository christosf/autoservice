<script setup>
import { defineModel, ref, computed, inject, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoreFunctions, useCoreRules } from '../../../core/composables'
import { useContactAPI } from '../../../contacts/composables'
import { useContactStore } from '../../../contacts/store'

const model = defineModel({ required: true })

const { t: $t } = useI18n()
const { getFilteredContacts } = useContactAPI()
const { required } = useCoreRules()
const { openNewTab } = useCoreFunctions()
const contactStore = useContactStore()

const insertContactDialogRef = inject('insertContactDialogRef')
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

const addNewContact = () => {
  insertContactDialogRef.value.show({ origin: 'insertVehicleDialog' })
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

  const contacts = await getFilteredContacts({ filter })

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

contactStore.$onAction(({ name, after }) => {
  if (name === 'setProvidedContact') {
    after(() => {
      model.value = contactStore.providedContact
      contactStore.clearProvidedContact()

      nextTick(() => {
        insertContactDialogRef.value.hide()
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
    ref='fieldRef'
    lazy-rules='ondemand'
    hide-dropdown-icon
    use-input
    clearable
    bottom-slots
    label-slot
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_person' />
    </template>
    <template #label>
      <span>{{ $t('vehicles.owner') }}</span>
      <span class='text-red-8 q-pl-xs'>*</span>
    </template>
    <template v-slot:option='{ itemProps, opt }'>
      <q-item v-bind='itemProps' class='add-relation-item'>
        <q-item-section>
          <q-item-label>
            <span class='text-bold'>{{ opt.name }}</span>
            <q-chip size='sm' icon='sym_o_tag' class='q-ma-none q-ml-xs' square>
              {{ opt.code }}
            </q-chip>
          </q-item-label>
          <q-item-label caption>{{ opt.phoneNumber }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected-item='{ opt }'>
      <span>{{ opt.name }}</span>
      <q-chip
        @click='openNewTab({ name: "ViewContact", params: { code: opt.code } })'
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
        <q-item @click='addNewContact' class='add-relation-item' clickable dense>
          <q-item-section>
            <q-item-label class='text-caption text-primary'>
              {{ $t('contacts.add_new_contact') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
    <template #after-options>
      <div class='after-options-slot'>
        <q-item @click='addNewContact' class='add-relation-item' clickable dense>
          <q-item-section>
            <q-item-label class='text-caption text-primary'>
              {{ $t('contacts.add_new_contact') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
  </q-select>
</template>
