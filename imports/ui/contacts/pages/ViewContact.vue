<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' class='q-gutter-sm' padding>
    <template v-if='contact'>
      <q-card bordered flat>
        <q-card-section class='q-pa-none'>
          <q-toolbar>
            <q-icon
              :name='isCompany(contact.type) ? "domain" : "person"'
              class='q-mr-md q-ml-xs'
              color='primary'
              size='36px'
            />
            <div class='q-my-sm' :class='{ "q-my-md": $q.screen.gt.sm }'>
              <div class='text-h4 text-bold q-mb-xs'>{{ contact.name }}</div>
              <div class='text-caption'>{{ `${$t('core.code')}: ${contact.code}` }}</div>
            </div>
            <q-space />
            <div class='q-gutter-sm'>
              <q-btn
                @click='editDialogRef.open(contact._id, contact.code)'
                :label='$q.screen.gt.xs ? $t("core.edit") : ""'
                :dense='$q.screen.lt.sm'
                padding='xs sm'
                color='primary'
                icon='edit'
                outline
                no-caps
              />
              <q-btn-group outline>
                <q-btn
                  @click='goToContactCode("prev")'
                  color='secondary'
                  icon='chevron_left'
                  padding='xs'
                  outline
                />
                <q-btn
                  @click='goToContactCode("next")'
                  color='secondary'
                  icon='chevron_right'
                  padding='xs'
                  outline
                />
              </q-btn-group>
            </div>
          </q-toolbar>
        </q-card-section>
        <q-separator />
        <q-tabs
          @touchstart.stop
          @mousedown.stop
          align='left'
          active-color='primary'
          inline-label
          no-caps
        >
          <template v-for='tab in routeTabs'>
            <q-route-tab
                v-if='["vehicles", "job-cards"].includes(tab.name)
                  ? contact.vehicles.length > 0
                  : true
                '
                :to='{ name: "ViewContact", params: {
                  code: contact.code,
                  view: tab.view ? tab.view : undefined }
                }'
                :key='tab.name'
                :label='$t(tab.label)'
                :icon='tab.icon'
            />
          </template>
        </q-tabs>
      </q-card>
      <q-tab-panels
          v-model='activeTab'
          transition-prev='fade'
          transition-next='fade'
          animated
      >
          <q-tab-panel name='overview' class='q-pa-none'>
              <overview-tab-panel :contact='contact' />
          </q-tab-panel>
          <q-tab-panel name='vehicles' class='q-pa-none'>
              <vehicles-tab-panel :contact='contact' />
          </q-tab-panel>
          <q-tab-panel name='job-cards' class='q-pa-none'>
              <q-card bordered flat>
                  <q-card-section>
                      Not yet available.
                  </q-card-section>
              </q-card>
          </q-tab-panel>
          <q-tab-panel name='history' class='q-pa-none'>
              <history-tab-panel :id='contact._id' type='contacts' />
          </q-tab-panel>
      </q-tab-panels>
    </template>
    <loading-card v-else :loading='loading' :message='$t("contacts.loading_one")' />
    <edit-contact-dialog ref='editDialogRef' />
  </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta, useQuasar } from '../../quasar'
import { useContactAPI, useContactFunctions } from '../composables'

import LoadingCard from '../../core/components/LoadingCard.vue'
import OverviewTabPanel from '../components/OverviewTabPanel.vue'
import HistoryTabPanel from '../../history-log/components/HistoryTabPanel.vue'
import VehiclesTabPanel from '../components/VehiclesTabPanel.vue'
import EditContactDialog from '../components/EditContactDialog.vue'

export default {
  components: {
    LoadingCard,
    OverviewTabPanel,
    HistoryTabPanel,
    VehiclesTabPanel,
    EditContactDialog
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()
    const { t: $t } = useI18n()
    const { getContact, getPrevNextContactCode } = useContactAPI()
    const { isCompany } = useContactFunctions()

    const vueReactiveDependencies = new Tracker.Dependency()
    const editDialogRef = ref(null)
    const getContactQuery = getContact.clone()
    const title = ref($t('contacts.view'))
    const loading = ref(true)
    const activeTab = ref('overview')
    const contact = ref(null)
    const availableViews = ['vehicles', 'job-cards', 'history']
    let subscription

    const routeTabs = [
      {
        name: 'overview',
        label: 'core.overview',
        icon: 'dataset'
      },
      {
        name: 'vehicles',
        label: 'vehicles.many',
        icon: 'commute',
        view: 'vehicles'
      },
      {
        name: 'job-cards',
        label: 'job_cards.many',
        icon: 'build_circle',
        view: 'job-cards'
      },
      {
        name: 'history',
        label: 'core.history',
        icon: 'history',
        view: 'history'
      }
    ]

    const handleSwipeRight = () => router.push({ name: 'ContactList' })

    const goToContactCode = (type) => {
      let value = route.params.code
      let sortBy = 'code'
      let descending = true

      if ($q.localStorage.has('contactListPagination')) {
        const localStoragePagination = $q.localStorage.getItem('contactListPagination')

        if (localStoragePagination.sortBy !== 'vehicleCount') {
          sortBy = localStoragePagination.sortBy
          descending = localStoragePagination.descending

          if (sortBy === 'name') {
            sortBy = 'searchableName'
            value = contact.value.searchableName
          } else {
            value = contact.value[sortBy]
          }
        }
      }

      getPrevNextContactCode({ type, value, sortBy, descending }).then((response) => {
        router.push({ name: 'ViewContact', params: { code: response } })
      })
    }

    watch(route, () => {
      if (route.name === 'ViewContact') {
        if (contact.value && contact.value.code !== route.params.code) {
          vueReactiveDependencies.changed()
        }

        if (route.params.view && availableViews.includes(route.params.view)) {
          activeTab.value = route.params.view
        } else {
          activeTab.value = 'overview'
          router.replace({ name: 'ViewContact', params: { code: route.params.code } })
        }
      }
    }, { immediate: true })

    const tracker = Tracker.autorun(() => {
      vueReactiveDependencies.depend()
      loading.value = true

      getContactQuery.setParams({ code: route.params.code })
      subscription = getContactQuery.subscribe()

      if (subscription.ready()) {
        contact.value = getContactQuery.fetchOne()

        if (!contact.value) {
          router.replace({ name: 'NotFound' })
          return
        }

        title.value = `${contact.value.name} - ${$t('contacts.one')}`
        loading.value = false
      }
    })

    onUnmounted(() => {
      subscription.stop()
      tracker.stop()
    })

    useMeta(() => ({
      title: title.value
    }))

    return {
      editDialogRef,
      loading,
      activeTab,
      contact,
      routeTabs,
      isCompany,
      handleSwipeRight,
      goToContactCode
    }
  }
}
</script>
