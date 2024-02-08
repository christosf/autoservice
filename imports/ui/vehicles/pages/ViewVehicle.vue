<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useVehicleAPI, useVehicleFunctions } from '../composables'
import LoadingCard from '../../core/components/LoadingCard.vue'
import VehicleFormDialog from '../components/VehicleFormDialog.vue'
import PrevNextBtnGroup from '../../core/components/PrevNextBtnGroup.vue'
import TabPanelOverview from '../components/TabPanelOverview.vue'
import TabPanelHistory from '../../history_log/components/TabPanelHistory.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const { getVehicleQuery, getVehicleCode } = useVehicleAPI()
const { deactivateVehicle, activateVehicle, removeVehicle } = useVehicleFunctions()

const updateVehicleDialogRef = ref(null)
const getVehicle = getVehicleQuery.clone()
const vueDependency = new Tracker.Dependency()
const title = ref($t('vehicles.view'))
const isLoading = ref(true)
const vehicle = ref(null)
const activeTab = ref('overview')
const availableViews = ['job-cards', 'history']

const routeTabs = [
  {
    name: 'overview',
    label: 'core.overview',
    icon: 'sym_o_dataset'
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

const handleSwipeRight = () => router.push({ name: 'VehicleList' })

const goToVehicleCode = async(type) => {
  let sortBy = 'code'
  let descending = true

  if ($q.localStorage.has('vehicleListPagination')) {
    const localStoragePagination = $q.localStorage.getItem('vehicleListPagination')

    sortBy = localStoragePagination.sortBy
    descending = localStoragePagination.descending
  }

  const code = await getVehicleCode({ type, vehicleId: vehicle.value._id, sortBy, descending })

  router.push({ name: 'ViewVehicle', params: { code, view: route.params.view } })
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getVehicle.setParams({ code: route.params.code })
  const subscription = getVehicle.subscribe()

  if (subscription.ready()) {
    vehicle.value = getVehicle.fetchOne()

    if (!vehicle.value) {
      router.replace({ name: 'NotFound' })
      return
    }

    title.value = vehicle.value.regNumber
      ? `${vehicle.value.regNumber} : ${vehicle.value.makeModel} - ${$t('vehicles.one')}`
      : `${vehicle.value.makeModel} - ${$t('vehicles.one')}`

    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'ViewVehicle') {
    if (vehicle.value && vehicle.value.code !== route.params.code) {
      vueDependency.changed()
    }

    if (route.params.view && availableViews.includes(route.params.view.toString())) {
      activeTab.value = route.params.view.toString()
    } else {
      activeTab.value = 'overview'
      router.replace({ name: 'ViewVehicle', params: { code: route.params.code } })
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
      <div v-if='!isLoading' :key='vehicle.code' class='q-gutter-sm'>
        <q-card bordered flat>
          <q-card-section class='q-pa-none border-bottom'>
            <q-toolbar>
              <q-icon
                name='sym_o_directions_car'
                class='gt-xs q-mr-md q-ml-xs'
                color='primary'
                size='36px'
              />
              <div class='q-my-sm' :class='{ "q-my-md": $q.screen.gt.sm }'>
                <div class='text-h4 text-bold q-mb-xs'>{{ vehicle.makeModel }}</div>
                <div class='text-caption'>{{ `${$t('core.code')}: ${vehicle.code}` }}</div>
              </div>
              <q-space />
              <div class='q-gutter-sm text-right'>
                <q-btn
                  v-if='vehicle.isActive'
                  @click='updateVehicleDialogRef.show({
                    vehicleId: vehicle._id,
                    vehicleCode: vehicle.code
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
                    @click='activateVehicle({ vehicleId: vehicle._id })'
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
                    @click='removeVehicle({ vehicleId: vehicle._id })'
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
                  @previous='goToVehicleCode("prev")'
                  @next='goToVehicleCode("next")'
                />
                <q-btn-dropdown
                  v-if='vehicle.isActive'
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
                    <q-item @click='deactivateVehicle({ vehicleId: vehicle._id })' clickable>
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
                :to='{ name: "ViewVehicle", params: {
                  code: vehicle.code,
                  view: tab.view ? tab.view : undefined }
                }'
                :label='$t(tab.label)'
                :icon='tab.icon'
              />
            </template>
          </q-tabs>
        </q-card>
        <q-banner v-if='!vehicle.isActive' class='bg-amber-3' rounded>
          <template #avatar>
            <q-icon name='sym_o_warning' />
          </template>
          <template #default>
            <div class='text-h6 text-bold q-mb-xs'>{{ $t('vehicles.deactivated_vehicle') }}</div>
            <div class='text-caption'>{{ $t('vehicles.msg_deactivated_vehicle') }}</div>
          </template>
        </q-banner>
        <q-banner v-if='!vehicle.owner.isActive' class='bg-amber-3' rounded>
          <template #avatar>
            <q-icon name='sym_o_warning' />
          </template>
          <template #default>
            <div class='text-h6 text-bold q-mb-xs'>{{ $t('vehicles.deactivated_owner') }}</div>
            <div class='text-caption'>{{ $t('vehicles.msg_deactivated_owner') }}</div>
          </template>
        </q-banner>
        <q-tab-panels
          v-model='activeTab'
          transition-prev='fade'
          transition-next='fade'
          animated
        >
          <q-tab-panel name='overview' class='q-pa-none'>
            <tab-panel-overview :vehicle='vehicle' />
          </q-tab-panel>
          <q-tab-panel name='job-cards' class='q-pa-none'>
            <!-- <tab-panel-job-cards :vehicle='vehicle' /> -->
            <q-card bordered flat>
              <q-card-section>
                Not yet available.
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel name='history' class='q-pa-none'>
            <tab-panel-history :object-id='vehicle._id' object-type='vehicles' />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <loading-card v-else :loading='isLoading' :message='$t("vehicles.loading_one")' />
    </transition>
    <vehicle-form-dialog type='update' ref='updateVehicleDialogRef' />
  </q-page>
</template>
