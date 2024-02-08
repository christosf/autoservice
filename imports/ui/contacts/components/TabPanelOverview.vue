<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useContactAPI } from '../composables'
import { useCoreFunctions } from '../../core/composables'
import InternalNotesCard from '../../core/components/InternalNotesCard.vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})

const $q = useQuasar()
const router = useRouter()
const { t: $t } = useI18n()
const { ContactMethodTypesEnum, updateNotes } = useContactAPI()
const { notifySuccess, notifyError, unsavedChangesDialog } = useCoreFunctions()

const notesCardRef = ref(null)
const notesCardModel = ref('')
const isNotesCardSubmitted = ref(false)

const phoneNumbers = computed(() => {
  const list = props.contact.contactMethods.filter((method) => (
    method.type === ContactMethodTypesEnum.PHONE
  ))

  list.unshift({
    value: props.contact.phoneNumber,
    description: $t('contacts.main_phone_number')
  })

  return list
})

const emails = computed(() => (
  props.contact.contactMethods.filter((method) => method.type === ContactMethodTypesEnum.EMAIL)
))

const faxNumbers = computed(() => (
  props.contact.contactMethods.filter((method) => method.type === ContactMethodTypesEnum.FAX)
))

const websites = computed(() => (
  props.contact.contactMethods.filter((method) => method.type === ContactMethodTypesEnum.WEBSITE)
))

const billingAddress = computed(() => (
  props.contact.billingAddress
    ? Object.values(props.contact.billingAddress).join(', ')
    : null
))

const deliveryAddress = computed(() => (
  props.contact.deliveryAddress
    ? Object.values(props.contact.deliveryAddress).join(', ')
    : null
))

const isNotesCardBtnDisabled = computed(() => (
  (notesCardModel.value && notesCardModel.value.trim() === props.contact.notes)
  || (notesCardModel.value === '' && !props.contact.notes)
))

const submitNotes = async() => {
  isNotesCardSubmitted.value = true

  // @ts-ignore
  const { updated } = await updateNotes({ contactId: props.contact._id, notes: notesCardModel.value })

  if (updated) {
    notifySuccess($t('core.msg_notes_update_successful'))
  } else {
    notifyError()
  }

  isNotesCardSubmitted.value = false
  notesCardRef.value.focus()
}

watchEffect(() => {
  notesCardModel.value = props.contact.notes ? props.contact.notes : ''
})

onBeforeRouteUpdate((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.contact.notes ? props.contact.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})

onBeforeRouteLeave((to) => {
  if (!isNotesCardBtnDisabled.value) {
    unsavedChangesDialog({ msg: $t('core.msg_unsaved_notes') }).onCancel(() => {
      notesCardModel.value = props.contact.notes ? props.contact.notes : ''
      router.push(to.fullPath)
    })
    return false
  }
  return true
})
</script>

<template>
  <div class='row q-col-gutter-sm'>
    <div class='col-xs-12 col-sm-12 col-md-7'>
      <div class='q-gutter-sm'>

        <q-card v-if='$q.screen.lt.md' bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>{{ $t('contacts.balance') }}</q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <span v-if='contact.balance'>&euro; {{ props.contact.balance }}</span>
            <span v-else>&euro; 0</span>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('contacts.contact_phone_numbers') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='(phoneNumber, index) in phoneNumbers'
                :key='phoneNumber.value'
                :href='`tel:${phoneNumber.value}`'
                class='q-py-sm'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_call' :color='index === 0 ? "primary" : "secondary"' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ phoneNumber.value }}</q-item-label>
                  <q-item-label v-if='phoneNumber.description' caption>
                    {{ phoneNumber.description }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('contacts.email_addresses') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <template v-if='emails.length > 0'>
                <q-item
                  v-for='email in emails'
                  :key='email.value'
                  :href='`mailto:${email.value}`'
                  class='q-py-sm'
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name='sym_o_email' color='secondary' />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ email.value }}</q-item-label>
                    <q-item-label v-if='email.description' caption>{{ email.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <div v-else class='q-py-sm q-px-md text-caption text-grey'>
                {{ $t('core.none') }}
              </div>
            </q-list>
          </q-card-section>
        </q-card>

        <internal-notes-card
          v-model='notesCardModel'
          @submit='submitNotes'
          :disabled='isNotesCardBtnDisabled'
          :submitted='isNotesCardSubmitted'
          ref='notesCardRef'
        />

      </div>
    </div>
    <div class='col-xs-12 col-sm-12 col-md-5'>
      <div class='q-gutter-sm'>

        <q-card v-if='$q.screen.gt.sm' bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm'>{{ $t('contacts.balance') }}</q-card-section>
          <q-card-section class='text-body1 q-pt-none q-pb-sm'>
            <span v-if='props.contact.balance'>&euro; {{ props.contact.balance }}</span>
            <span v-else>&euro; 0</span>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm border-bottom'>
            {{ $t('core.tags') }}
          </q-card-section>
          <q-card-section v-if='props.contact.tags && props.contact.tags.length > 0' class='q-py-sm'>
            <q-chip v-for='tag in props.contact.tags' :key='tag' class='q-ma-none q-mr-sm' square>
              {{ tag }}
            </q-chip>
          </q-card-section>
          <q-card-section v-else class='text-caption text-grey q-py-sm'>
            {{ $t('core.none') }}
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm border-bottom'>
            {{ $t('core.address_billing') }}
          </q-card-section>
          <q-card-section v-if='billingAddress' class='q-py-sm'>
            {{ billingAddress }}
          </q-card-section>
          <q-card-section v-else class='text-caption text-grey q-py-sm'>
            {{ $t('core.not_set') }}
          </q-card-section>
        </q-card>

        <q-card v-if='deliveryAddress' bordered flat>
          <q-card-section class='text-h6 text-bold q-py-sm border-bottom'>
            {{ $t('core.address_delivery') }}
          </q-card-section>
          <q-card-section class='q-py-sm'>{{ deliveryAddress }}</q-card-section>
        </q-card>

        <q-card v-if='contact.taxRegNumber' bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('contacts.tax_reg_number') }}
          </q-card-section>
          <q-card-section class='q-py-sm'>{{ props.contact.taxRegNumber }}</q-card-section>
        </q-card>

        <q-card v-if='faxNumbers.length > 0' bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('contacts.fax') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='fax in faxNumbers'
                :key='fax.value'
                :href='`tel:${fax.value}`'
                class='q-py-sm'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_fax' color='secondary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ fax.value }}</q-item-label>
                  <q-item-label v-if='fax.description' caption>{{ fax.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card v-if='websites.length > 0' bordered flat>
          <q-card-section class='q-py-sm text-h6 text-bold border-bottom'>
            {{ $t('contacts.websites') }}
          </q-card-section>
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='website in websites'
                :key='website.value'
                :href='website.value'
                target='_blank'
                class='q-py-sm'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_travel_explore' color='secondary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ website.value }}</q-item-label>
                  <q-item-label v-if='website.description' caption>{{ website.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

      </div>
    </div>
  </div>
</template>
