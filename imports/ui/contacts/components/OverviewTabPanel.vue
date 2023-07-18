<template>
  <div class='row q-col-gutter-sm'>
    <div class='col-xs-12 col-sm-12 col-md-7'>
      <div class='q-gutter-sm'>
        <q-card v-if='$q.screen.lt.md' bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('contacts.balance') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <span v-if='contact.balance'>&euro; {{ contact.balance }}</span>
            <span v-else>&euro; 0</span>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('contacts.contact_phone_numbers') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='(phoneNumber, index) in phoneNumbers'
                :key='phoneNumber.value'
                :href='`tel:${phoneNumber.value}`'
                class='q-py-md'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_call' :color='index === 0 ? "primary" : "secondary"' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ phoneNumber.value }}</q-item-label>
                  <q-item-label caption>{{ phoneNumber.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('contacts.email_addresses') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <template v-if='emails.length > 0'>
                <q-item
                  v-for='email in emails'
                  :key='email.value'
                  :href='`mailto:${email.value}`'
                  class='q-py-md'
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name='sym_o_email' color='secondary' />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class='text-body1'>{{ email.value }}</q-item-label>
                    <q-item-label caption>{{ email.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <q-item v-else class='q-py-md'>
                <q-item-section>
                  <q-item-label class='text-body1 text-italic text-grey'>
                    {{ $t('core.none_1') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <q-card v-if='faxNumbers.length > 0' bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('contacts.fax') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='fax in faxNumbers'
                :key='fax.value'
                :href='`tel:${fax.value}`'
                class='q-py-md'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_fax' color='secondary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ fax.value }}</q-item-label>
                  <q-item-label caption>{{ fax.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <notes-card :id='contact._id' :notes='contact.notes' type='contacts' />
      </div>
    </div>
    <div class='col-xs-12 col-sm-12 col-md-5'>
      <div class='q-gutter-sm'>
        <q-card v-if='$q.screen.gt.sm' bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('contacts.balance') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <span v-if='contact.balance'>&euro; {{ contact.balance }}</span>
            <span v-else>&euro; 0</span>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('core.tags') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <template v-if='contact.tags && contact.tags.length > 0'>
              <q-chip
                v-for='tag in contact.tags'
                :key='tag'
                class='q-ml-none'
                square
              >
                {{ tag }}
              </q-chip>
            </template>
            <span v-else class='text-italic text-grey'>{{ $t('core.none_1') }}</span>
          </q-card-section>
        </q-card>
        <q-card bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('contacts.address_billing') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            <span v-if='billingAddress'>{{ billingAddress }}</span>
            <span v-else class='text-italic text-grey'>{{ $t('core.not_set') }}</span>
          </q-card-section>
          <template v-if='deliveryAddress'>
            <q-separator />
            <q-card-section class='text-h6 text-bold q-pb-sm'>
              {{ $t('contacts.address_delivery') }}
            </q-card-section>
            <q-card-section class='text-body1 q-pt-none'>
              {{ deliveryAddress }}
            </q-card-section>
          </template>
        </q-card>
        <q-card v-if='contact.taxRegNumber' bordered flat>
          <q-card-section class='text-h6 text-bold q-pb-sm'>
            {{ $t('contacts.tax_reg_number') }}
          </q-card-section>
          <q-card-section class='text-body1 q-pt-none'>
            {{ contact.taxRegNumber }}
          </q-card-section>
        </q-card>
        <q-card v-if='websites.length > 0' bordered flat>
          <q-card-section class='text-h6 text-bold'>
            {{ $t('contacts.websites') }}
          </q-card-section>
          <q-separator />
          <q-card-section class='q-pa-none'>
            <q-list separator>
              <q-item
                v-for='website in websites'
                :key='website.value'
                :href='website.value'
                target='_blank'
                class='q-py-md'
                clickable
              >
                <q-item-section avatar>
                  <q-icon name='sym_o_travel_explore' color='secondary' />
                </q-item-section>
                <q-item-section>
                  <q-item-label class='text-body1'>{{ website.value }}</q-item-label>
                  <q-item-label caption>{{ website.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactAPI } from '../composables'
import NotesCard from '../../core/components/NotesCard.vue'

export default {
  components: {
    NotesCard
  },
  props: {
    contact: Object
  },
  setup(props) {
    const { t: $t } = useI18n()
    const { contact } = toRefs(props)
    const { ContactMethodsEnum } = useContactAPI()

    const phoneNumbers = computed(() => {
      const array = contact.value.contactMethods.filter((method) => (
        method.type === ContactMethodsEnum.PHONE
      ))

      array.unshift({
        value: contact.value.phoneNumber,
        description: $t('contacts.main_phone_number')
      })

      return array
    })

    const emails = computed(() => (
      contact.value.contactMethods.filter((method) => method.type === ContactMethodsEnum.EMAIL)
    ))

    const faxNumbers = computed(() => (
      contact.value.contactMethods.filter((method) => method.type === ContactMethodsEnum.FAX)
    ))

    const websites = computed(() => (
      contact.value.contactMethods.filter((method) => method.type === ContactMethodsEnum.WEBSITE)
    ))

    const billingAddress = computed(() => (
      contact.value.billingAddress
        ? Object.values(contact.value.billingAddress).join(', ')
        : null
    ))

    const deliveryAddress = computed(() => (
      contact.value.deliveryAddress
        ? Object.values(contact.value.deliveryAddress).join(', ')
        : null
    ))

    return {
      contact,
      phoneNumbers,
      emails,
      faxNumbers,
      websites,
      billingAddress,
      deliveryAddress
    }
  }
}
</script>
