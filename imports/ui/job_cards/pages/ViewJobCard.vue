<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useJobCardAPI } from '../composables'
import LoadingCard from '../../core/components/LoadingCard.vue'
import PrevNextBtnGroup from '../../core/components/PrevNextBtnGroup.vue'
import TabPanelOverview from '../components/TabPanelOverview.vue'
import TabPanelHistory from '../../history_log/components/TabPanelHistory.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const { getJobCardQuery, goToJobCardCode } = useJobCardAPI()

const getJobCard = getJobCardQuery.clone()
const vueDependency = new Tracker.Dependency()
const title = ref($t('job_cards.view'))
const isLoading = ref(true)
const jobCard = ref(null)
const activeTab = ref('overview')
const availableViews = ['files', 'history']

const routeTabs = [
  {
    name: 'overview',
    label: 'core.overview',
    icon: 'sym_o_dataset'
  },
  {
    name: 'files',
    label: 'core.files',
    icon: 'sym_o_home_storage',
    view: 'files'
  },
  {
    name: 'history',
    label: 'core.history',
    icon: 'sym_o_history',
    view: 'history'
  }
]

const vehicleLabel = computed(() => {
  let label = ''

  if (jobCard.value.vehicle.regNumber) {
    label += `${jobCard.value.vehicle.regNumber} : `
  }

  label += jobCard.value.vehicle.makeModel

  if (!jobCard.value.vehicle.regNumber && jobCard.value.vehicle.chassisNumber) {
    label += ` (${jobCard.value.vehicle.chassisNumber})`
  }

  return label
})

const handleSwipeRight = () => router.push({ name: 'JobCardList' })

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getJobCard.setParams({ code: route.params.code })
  const subscription = getJobCard.subscribe()

  if (subscription.ready()) {
    jobCard.value = getJobCard.fetchOne()

    if (!jobCard.value) {
      router.replace({ name: 'NotFound' })
      return
    }

    title.value = jobCard.value.vehicle.regNumber
      ? `${jobCard.value.vehicle.regNumber} : ${jobCard.value.vehicle.makeModel} - ${$t('job_cards.one')}`
      : `${jobCard.value.vehicle.makeModel} - ${$t('job_cards.one')}`

    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'ViewJobCard') {
    if (jobCard.value && jobCard.value.code !== route.params.code) {
      vueDependency.changed()
    }

    if (route.params.view && availableViews.includes(route.params.view.toString())) {
      activeTab.value = route.params.view.toString()
    } else {
      activeTab.value = 'overview'
      router.replace({ name: 'ViewJobCard', params: { code: route.params.code } })
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
      <div v-if='!isLoading' :key='jobCard.code' class='q-gutter-sm'>
        <q-card bordered flat>
          <q-card-section class='q-pa-none border-bottom'>
            <q-toolbar>
              <q-icon
                name='sym_o_build_circle'
                class='gt-xs q-mr-md q-ml-xs'
                color='primary'
                size='36px'
              />
              <div class='q-my-sm'>
                <div class='q-mb-xs'>
                  <span class='text-h4 text-bold q-mr-sm'>{{ $t('job_cards.one') }}</span>
                  <q-chip class='q-ma-none text-caption' square>{{ jobCard.code }}</q-chip>
                </div>
                <router-link
                  :to='{ name: "ViewVehicle", params: { code: jobCard.vehicle.code }}'
                  class='text-h5 text-secondary'
                >
                  {{ vehicleLabel }}
                </router-link>
              </div>
              <q-space />
              <div class='q-gutter-sm text-right'>
                <prev-next-btn-group
                  @previous='goToJobCardCode("prev")'
                  @next='goToJobCardCode("next")'
                  :label-previous='$t("job_cards.previous")'
                  :label-next='$t("job_cards.next")'
                />
                <q-btn-dropdown
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
                    <!--
                    <q-item @click='deactivateContact({ contactId: contact._id })' clickable>
                      <q-item-section avatar>
                        <q-icon name='sym_o_visibility_off' />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('core.deactivate') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  -->
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
                :to='{ name: "ViewJobCard", params: {
                  code: jobCard.code,
                  view: tab.view ? tab.view : undefined }
                }'
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
            <tab-panel-overview :job-card='jobCard' />
          </q-tab-panel>
          <q-tab-panel name='files' class='q-pa-none'>
            <div></div>
          </q-tab-panel>
          <q-tab-panel name='history' class='q-pa-none'>
            <tab-panel-history :object-id='jobCard._id' object-type='jobCards' />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <loading-card v-else :loading='isLoading' :message='$t("job_cards.loading_one")' />
    </transition>
  </q-page>
</template>
