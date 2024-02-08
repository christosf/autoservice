<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useContactAPI, useContactFunctions } from '../composables'
import LoadingCard from '../../core/components/LoadingCard.vue'
import ContactFormDialog from '../components/ContactFormDialog.vue'
import PrevNextBtnGroup from '../../core/components/PrevNextBtnGroup.vue'
import TabPanelOverview from '../components/TabPanelOverview.vue'
import TabPanelVehicles from '../components/TabPanelVehicles.vue'
import TabPanelJobCards from '../components/TabPanelJobCards.vue'
import TabPanelHistory from '../../history_log/components/TabPanelHistory.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const { getContactQuery, getContactCode } = useContactAPI()
const { isCompany, deactivateContact, activateContact, removeContact } = useContactFunctions()

const updateContactDialogRef = ref(null)
const getContact = getContactQuery.clone()
const vueDependency = new Tracker.Dependency()
const title = ref($t('contacts.view'))
const isLoading = ref(true)
const contact = ref(null)
const activeTab = ref('overview')
const availableViews = ['vehicles', 'job-cards', 'history']

const routeTabs = [
  {
    name: 'overview',
    label: 'core.overview',
    icon: 'sym_o_dataset'
  },
  {
    name: 'vehicles',
    label: 'vehicles.many',
    icon: 'sym_o_commute',
    view: 'vehicles'
  },
  {
    name: 'job-cards',
    label: 'job_cards.many',
    icon: 'sym_o_build_circle',
    view: 'job-cards'
  },
  {
    name: 'history',
    label: 'core.history',
    icon: 'sym_o_history',
    view: 'history'
  }
]

const handleSwipeRight = () => router.push({ name: 'ContactList' })

const goToContactCode = async(type) => {
  let sortBy = 'code'
  let descending = true

  if ($q.localStorage.has('contactListPagination')) {
    const localStoragePagination = $q.localStorage.getItem('contactListPagination')

    sortBy = localStoragePagination.sortBy
    descending = localStoragePagination.descending
  }

  const code = await getContactCode({ type, contactId: contact.value._id, sortBy, descending })

  router.push({ name: 'ViewContact', params: { code, view: route.params.view } })
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getContact.setParams({ code: route.params.code })
  const subscription = getContact.subscribe()

  if (subscription.ready()) {
    contact.value = getContact.fetchOne()

    if (!contact.value) {
      router.replace({ name: 'NotFound' })
      return
    }

    title.value = `${contact.value.name} - ${$t('contacts.one')}`
    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'ViewContact') {
    if (contact.value && contact.value.code !== route.params.code) {
      vueDependency.changed()
    }

    if (route.params.view && availableViews.includes(route.params.view.toString())) {
      activeTab.value = route.params.view.toString()
    } else {
      activeTab.value = 'overview'
      router.replace({ name: 'ViewContact', params: { code: route.params.code } })
    }
  }
}, { immediate: true })

onUnmounted(() => tracker.stop())

useMeta(() => ({
  title: title.value
}))
</script>

<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' padding>
    <transition name='fade' mode='out-in'>
      <div v-if='!isLoading' :key='contact.code' class='q-gutter-sm'>
        <q-card bordered flat>
          <q-card-section class='q-pa-none border-bottom'>
            <q-toolbar>
              <q-icon
                :name='isCompany({ type: contact.type }) ? "sym_o_domain" : "sym_o_person"'
                class='gt-xs q-mr-md q-ml-xs'
                color='primary'
                size='36px'
              />
              <div class='q-my-sm'>
                <div class='text-h4 text-bold q-mb-xs'>{{ contact.name }}</div>
                <div class='text-caption'>{{ `${$t('core.code')}: ${contact.code}` }}</div>
              </div>
              <q-space />
              <div class='q-gutter-sm text-right'>
                <q-btn
                  v-if='contact.isActive'
                  @click='updateContactDialogRef.show({
                    contactId: contact._id,
                    contactCode: contact.code
                  })'
                  :label='$q.screen.gt.xs ? $t("core.edit") : ""'
                  padding='xs sm'
                  size='13px'
                  color='primary'
                  icon='sym_o_edit'
                  outline
                  no-caps
                />
                <template v-else>
                  <q-btn
                    @click='activateContact({ contactId: contact._id })'
                    :label='$q.screen.gt.xs ? $t("core.activate") : ""'
                    padding='xs sm'
                    size='13px'
                    color='positive'
                    icon='sym_o_visibility'
                    outline
                    no-caps
                  >
                    <q-tooltip v-if='$q.screen.lt.sm'>{{ $t('core.activate') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    @click='removeContact({ contactId: contact._id })'
                    padding='xs sm'
                    size='13px'
                    color='negative'
                    icon='sym_o_delete'
                    outline
                    no-caps
                  >
                    <q-tooltip>{{ $t('core.delete') }}</q-tooltip>
                  </q-btn>
                </template>
                <prev-next-btn-group
                  @previous='goToContactCode("prev")'
                  @next='goToContactCode("next")'
                  :label-previous='$t("contacts.previous")'
                  :label-next='$t("contacts.next")'
                />
                <q-btn-dropdown
                  v-if='contact.isActive'
                  :menu-offset='[0,5]'
                  dropdown-icon='sym_o_more_vert'
                  content-class='custom-dropdown-menu'
                  color='secondary'
                  padding='xs'
                  size='13px'
                  outline
                  no-caps
                >
                  <q-list :dense='$q.platform.is.desktop' separator v-close-popup>
                    <q-item @click='deactivateContact({ contactId: contact._id })' clickable>
                      <q-item-section avatar>
                        <q-icon name='sym_o_visibility_off' />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('core.deactivate') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </q-toolbar>
          </q-card-section>
          <q-tabs
            @touchstart.stop
            @mousedown.stop
            align='left'
            active-color='primary'
            inline-label
            no-caps
          >
            <template v-for='tab in routeTabs' :key='tab.name'>
              <q-route-tab
                :to='{ name: "ViewContact", params: {
                  code: contact.code,
                  view: tab.view ? tab.view : undefined }
                }'
                :label='$t(tab.label)'
                :icon='tab.icon'
              />
            </template>
          </q-tabs>
        </q-card>
        <q-banner v-if='!contact.isActive' class='bg-amber-3' rounded>
          <template #avatar>
            <q-icon name='sym_o_warning' />
          </template>
          <template #default>
            <div class='text-h6 text-bold q-mb-xs'>{{ $t('contacts.deactivated_contact') }}</div>
            <div class='text-caption'>{{ $t('contacts.msg_deactivated_contact') }}</div>
          </template>
        </q-banner>
        <q-tab-panels
          v-model='activeTab'
          transition-prev='fade'
          transition-next='fade'
          animated
        >
          <q-tab-panel name='overview' class='q-pa-none'>
            <tab-panel-overview :contact='contact' />
          </q-tab-panel>
          <q-tab-panel name='vehicles' class='q-pa-none'>
            <tab-panel-vehicles :contact='contact' />
          </q-tab-panel>
          <q-tab-panel name='job-cards' class='q-pa-none'>
            <tab-panel-job-cards :contact='contact' />
          </q-tab-panel>
          <q-tab-panel name='history' class='q-pa-none'>
            <tab-panel-history :object-id='contact._id' object-type='contacts' />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <loading-card v-else :loading='isLoading' :message='$t("contacts.loading_one")' />
    </transition>
    <contact-form-dialog type='update' ref='updateContactDialogRef' />
  </q-page>
</template>
