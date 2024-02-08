<script setup>
import draggable from 'vuedraggable'
import { defineModel, ref, reactive, computed, toRaw, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../../quasar'
import { useCoreFunctions, useCoreRules } from '../../../core/composables'
import { ContactMethodTypesEnum } from '../../../../api/contacts/enums'

const model = defineModel({ required: true })
const props = defineProps({
  fieldPhoneNumber: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['focusPhoneNumber'])

const $q = useQuasar()
const { t: $t } = useI18n()
const { isPhoneNumberValid, filterInputDigitsOnly } = useCoreFunctions()
const { required, email, url, phoneNumber } = useCoreRules()

const formRef = ref(null)
const valueFieldRef = ref(null)
const isDialogOpen = ref(false)
const editingIndex = ref(null)
const optionList = []

const form = reactive({
  type: ContactMethodTypesEnum.PHONE,
  value: '',
  description: ''
})

const valueAlreadyExists = ({ value, type = null, msg }) => {
  if (type === ContactMethodTypesEnum.PHONE && value === props.fieldPhoneNumber) {
    return msg
  }

  let exists = false
  model.value.forEach((item, index) => {
    if (value === item.value && index !== editingIndex.value) {
      exists = true
    }
  })

  if (exists) {
    return msg
  }
  return true
}

const rules = {
  phone: [
    (value) => required({ value, msg: $t('core.msg_field_required') }),
    (value) => phoneNumber({ value, msg: $t('contacts.msg_phone_number_invalid') }),
    (value) => valueAlreadyExists({
      value,
      type: ContactMethodTypesEnum.PHONE,
      msg: $t('contacts.msg_phone_number_exists')
    })
  ],
  email: [
    (value) => required({ value, msg: $t('core.msg_field_required') }),
    (value) => email({ value, msg: $t('core.msg_email_invalid') }),
    (value) => valueAlreadyExists({ value, msg: $t('contacts.msg_email_exists') })
  ],
  website: [
    (value) => required({ value, msg: $t('core.msg_field_required') }),
    (value) => url({ value, msg: $t('contacts.msg_website_invalid') }),
    (value) => valueAlreadyExists({ value, msg: $t('contacts.msg_website_exists') })
  ]
}

const valueFieldLabel = computed(() => {
  switch (form.type) {
    case ContactMethodTypesEnum.PHONE: return $t('contacts.phone_number')
    case ContactMethodTypesEnum.EMAIL: return $t('contacts.email_address')
    case ContactMethodTypesEnum.FAX: return $t('contacts.fax_number')
    case ContactMethodTypesEnum.WEBSITE: return $t('contacts.url_link')
    default: return $t('core.value')
  }
})

const valueFieldRules = computed(() => {
  switch (form.type) {
    case ContactMethodTypesEnum.PHONE: return rules.phone
    case ContactMethodTypesEnum.EMAIL: return rules.email
    case ContactMethodTypesEnum.FAX: return rules.phone
    case ContactMethodTypesEnum.WEBSITE: return rules.website
    default: return []
  }
})

const valueFieldIcon = computed(() => {
  switch (form.type) {
    case ContactMethodTypesEnum.PHONE: return 'sym_o_call'
    case ContactMethodTypesEnum.EMAIL: return 'sym_o_email'
    case ContactMethodTypesEnum.FAX: return 'sym_o_fax'
    case ContactMethodTypesEnum.WEBSITE: return 'sym_o_travel_explore'
    default: return 'sym_o_contact_mail'
  }
})

const valueFieldInputType = computed(() => {
  switch (form.type) {
    case ContactMethodTypesEnum.PHONE: return 'tel'
    case ContactMethodTypesEnum.EMAIL: return 'email'
    case ContactMethodTypesEnum.FAX: return 'tel'
    case ContactMethodTypesEnum.WEBSITE: return 'url'
    default: return 'text'
  }
})

const methodTypeLabel = (type) => {
  switch (type) {
    case ContactMethodTypesEnum.PHONE: return $t('contacts.phone')
    case ContactMethodTypesEnum.EMAIL: return $t('contacts.email')
    case ContactMethodTypesEnum.FAX: return $t('contacts.fax')
    case ContactMethodTypesEnum.WEBSITE: return $t('contacts.website')
    default: return ''
  }
}

const editMethod = (method, index) => {
  form.type = method.type
  form.value = method.value
  form.description = method.description

  editingIndex.value = index
  isDialogOpen.value = true
}

const removeMethod = (index) => {
  model.value.splice(index, 1)
}

const transformModel = () => {
  model.value.forEach((method, index) => {
    model.value[index] = toRaw(method)
  })
}

const hideForm = () => {
  isDialogOpen.value = false
}

const resetFormValidation = () => formRef.value.resetValidation()

const resetForm = () => {
  editingIndex.value = null

  form.type = ContactMethodTypesEnum.PHONE
  form.value = ''
  form.description = ''
}

const typeFieldUpdated = () => {
  resetFormValidation()
  form.value = ''

  if ($q.platform.is.desktop) {
    valueFieldRef.value.focus()
  }
}

const valueFieldKeydown = (event) => {
  if ([ContactMethodTypesEnum.PHONE, ContactMethodTypesEnum.FAX].includes(form.type)) {
    filterInputDigitsOnly(event)
  }
}

const submitForm = async() => {
  const valid = await formRef.value.validate()

  if (valid) {
    const method = structuredClone(toRaw(form))

    // Only check for null because 0 is accepted value.
    if (editingIndex.value === null) {
      model.value.push(method)
    } else {
      model.value[editingIndex.value].type = method.type
      model.value[editingIndex.value].value = method.value
      model.value[editingIndex.value].description = method.description
      editingIndex.value = null
    }

    hideForm()
  }
}

onBeforeMount(() => {
  const optionListLabel = ({ type }) => {
    switch (type) {
      case 'phone': return $t('contacts.phone')
      case 'email': return $t('contacts.email')
      case 'fax': return $t('contacts.fax')
      case 'website': return $t('contacts.website')
      default: return null
    }
  }

  Object.values(ContactMethodTypesEnum).forEach((method) => {
    optionList.push({
      value: method,
      label: optionListLabel({ type: method })
    })
  })
})
</script>

<template>
  <draggable
    v-model='model'
    @sort='transformModel'
    :component-data='{ bordered: true, separator: true, class: "field-contact-methods rounded-borders" }'
    item-key='value'
    tag='q-list'
    handle='.handle'
  >
    <template #header>
      <div class='header row bg-grey-1'>
        <q-icon name='sym_o_contact_phone' />
        <div class='title'>{{ $t('contacts.contact_methods') }}</div>
      </div>
      <q-item class='q-py-md'>
        <q-item-section avatar>
          <q-icon name='sym_o_drag_indicator' color='grey-6' disabled />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <span class='text-bold'>{{ $t('contacts.phone') }}: </span>
            <span v-if='props.fieldPhoneNumber'>
              <span>{{ props.fieldPhoneNumber }}</span>
              <span v-if='!isPhoneNumberValid(props.fieldPhoneNumber)' class='text-negative'>
                {{ `&nbsp;(${$t('core.not_valid')})` }}
              </span>
            </span>
            <span v-else class='text-italic text-grey'>{{ $t('core.not_set') }}</span>
          </q-item-label>
          <q-item-label class='q-mt-xs' caption>{{ $t('contacts.main_phone_number') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class='q-gutter-sm'>
            <q-btn
              @click='emit("focusPhoneNumber")'
              icon='sym_o_edit'
              color='secondary'
              size='sm'
              outline
              dense
            >
              <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </template>
    <template #item='{ element: method, index }'>
      <q-item class='q-py-sm'>
        <q-item-section class='handle' avatar>
          <q-icon name='sym_o_drag_indicator' color='secondary' />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <span class='text-bold'>{{ methodTypeLabel(method.type) }}: </span>
            <span>{{ method.value }}</span>
          </q-item-label>
          <q-item-label
            v-if='method.description'
            class='q-mt-xs'
            caption
          >
            {{ method.description }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class='q-gutter-sm'>
            <q-btn
              @click='editMethod(method, index)'
              icon='sym_o_edit'
              color='secondary'
              size='sm'
              outline
              dense
            >
              <q-tooltip anchor='top middle' self='bottom middle'>
                {{ $t('core.edit') }}
              </q-tooltip>
            </q-btn>
            <q-btn
              @click='removeMethod(index)'
              icon='sym_o_remove'
              color='negative'
              size='sm'
              outline
              dense
            >
              <q-tooltip anchor='top middle' self='bottom middle'>
                {{ $t('core.remove') }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </template>
    <template #footer>
      <div class='footer'>
        <q-btn
          v-if='props.fieldPhoneNumber && isPhoneNumberValid(props.fieldPhoneNumber)'
          @click='isDialogOpen = true'
          :label='$t("contacts.new_method")'
          icon='sym_o_playlist_add'
          color='primary'
          size='12px'
          outline
          no-caps
        />
        <q-banner v-else class='text-negative rounded-borders no-border q-pa-none' dense>
          {{ $t('contacts.msg_add_phone_number') }}
        </q-banner>
      </div>
    </template>
  </draggable>
  <q-dialog v-model='isDialogOpen' @hide='resetForm'>
    <q-card class='field-contact-methods-form'>
      <q-card-section class='q-pa-xs border-bottom'>
        <q-toolbar>
          <div class='text-h4 text-bold'>
            {{
              editingIndex === null
                ? $t('contacts.new_contact_method')
                : $t('contacts.edit_contact_method')
            }}
          </div>
          <q-space />
          <q-btn icon='sym_o_close' flat round dense v-close-popup />
        </q-toolbar>
      </q-card-section>
      <q-card-section>
        <q-form ref='formRef' class='q-gutter-md'>
          <q-select
            v-model='form.type'
            @update:model-value='typeFieldUpdated'
            :options='optionList'
            :options-dense='$q.platform.is.desktop'
            map-options
            emit-value
            bottom-slots
            label-slot
            outlined
          >
            <template #prepend>
              <q-icon name='sym_o_support_agent' />
            </template>
            <template #label>
              <span>{{ $t('core.type') }}</span>
              <span class='text-red-8 q-pl-xs'>{{ $t('core.asterisk') }}</span>
            </template>
            <template v-slot:option='{ itemProps, opt }'>
              <q-item v-bind='itemProps' class='add-relation-item'>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input
            v-model='form.value'
            @update:model-value='resetFormValidation'
            @keydown='valueFieldKeydown'
            :autofocus='$q.platform.is.desktop'
            :rules='valueFieldRules'
            :type='valueFieldInputType'
            lazy-rules='ondemand'
            ref='valueFieldRef'
            maxlength='100'
            bottom-slots
            label-slot
            outlined
          >
            <template #prepend>
              <q-icon :name='valueFieldIcon' />
            </template>
            <template #label>
              <span>{{ valueFieldLabel }}</span>
              <span class='text-red-8 q-pl-xs'>{{ $t('core.asterisk') }}</span>
            </template>
          </q-input>
          <q-input
            v-model='form.description'
            @update:model-value='resetFormValidation'
            :label='$t("core.short_description")'
            maxlength='80'
            bottom-slots
            outlined
          >
            <template #prepend>
              <q-icon name='sym_o_badge' />
            </template>
          </q-input>
          <div class='q-gutter-sm q-ml-sm'>
            <q-btn
              @click='submitForm'
              :label='editingIndex === null ? $t("core.add") : $t("core.save")'
              :icon='`sym_o_${editingIndex === null ? "playlist_add" : "save"}`'
              color='primary'
              outline
              no-caps
            />
            <q-btn
              @click='hideForm'
              :label='$t("core.cancel")'
              icon='sym_o_close'
              color='secondary'
              outline
              no-caps
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style>
.field-contact-methods {
  margin-top: 0;
  margin-bottom: 36px;
}

.field-contact-methods > .header {
  border-bottom: 1px solid rgba(0,0,0,0.12);
  padding: 8px 15px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 4px 4px 0 0;
}

.field-contact-methods > .header > .q-icon {
  padding-right: 15px;
  font-size: 24px;
  color: rgba(0,0,0,.54);
}

.field-contact-methods > .header > .title {
  line-height: 25px;
}

.field-contact-methods > .footer {
  padding: 8px 16px;
  border-top: 1px solid rgba(0,0,0,.12);
}

.field-contact-methods > .footer .text-body2 {
  font-size: 12px;
}

.field-contact-methods .handle {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.field-contact-methods-form {
  width: 100%;
  max-width: 500px;
}
</style>
