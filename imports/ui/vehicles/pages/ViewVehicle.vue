<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' class='q-gutter-sm' padding>
    <template v-if='vehicle'>
      <q-card bordered flat>
        <q-card-section class='q-pa-none'>
          <q-toolbar>
            <q-icon name='sym_o_directions_car' color='primary' size='36px' class='q-mr-md q-ml-xs' />
            <div class='q-my-sm' :class='{ "q-my-md": $q.screen.gt.sm }'>
              <div class='text-h4 text-bold q-mb-xs'>{{ vehicle.makeModel }}</div>
              <div class='text-caption'>{{ `${$t('core.code')}: ${vehicle.code}` }}</div>
            </div>
            <q-space />
            <div class='q-gutter-sm text-right'>
              <q-btn
                v-if='vehicle.isActive'
                @click='editDialogRef.open(vehicle._id, vehicle.code)'
                :label='$q.screen.gt.xs ? $t("core.edit") : ""'
                padding='xs sm'
                color='primary'
                icon='sym_o_edit'
                outline
                no-caps
              />
              <template v-else>
                <q-btn
                  @click='activateVehicle(vehicle._id)'
                  :label='$q.screen.gt.xs ? $t("core.activate") : ""'
                  padding='xs sm'
                  color='positive'
                  icon='sym_o_visibility'
                  outline
                  no-caps
                >
                  <q-tooltip v-if='$q.screen.lt.sm'>{{ $t('core.activate') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='deleteVehicle(vehicle._id)'
                  padding='xs sm'
                  color='negative'
                  icon='sym_o_delete'
                  outline
                  no-caps
                >
                  <q-tooltip>{{ $t('core.delete') }}</q-tooltip>
                </q-btn>
              </template>
              <q-btn-dropdown
                v-if='vehicle.isActive'
                :menu-offset='[0,5]'
                dropdown-icon='sym_o_more_vert'
                content-class='custom-dropdown-menu'
                color='secondary'
                padding='xs'
                outline
                no-caps
              >
                <q-list :dense='$q.platform.is.desktop' separator v-close-popup>
                  <q-item @click='deactivateVehicle(vehicle._id)' clickable>
                    <q-item-section avatar>
                      <q-icon name='sym_o_visibility_off' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('core.deactivate') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn-group outline>
                <q-btn
                  @click='goToVehicleCode("prev")'
                  color='secondary'
                  icon='sym_o_chevron_left'
                  padding='xs'
                  outline
                >
                  <q-tooltip>{{ $t('vehicles.previous') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='goToVehicleCode("next")'
                  color='secondary'
                  icon='sym_o_chevron_right'
                  padding='xs'
                  outline
                >
                  <q-tooltip>{{ $t('vehicles.next') }}</q-tooltip>
                </q-btn>
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
      <q-tab-panels
        v-model='activeTab'
        transition-prev='fade'
        transition-next='fade'
        animated
      >
        <q-tab-panel name='overview' class='q-pa-none'>
          <overview-tab-panel :vehicle='vehicle' />
        </q-tab-panel>
        <q-tab-panel name='job-cards' class='q-pa-none'>
          <q-card bordered flat>
            <q-card-section>
              Not yet available.
            </q-card-section>
          </q-card>
        </q-tab-panel>
        <q-tab-panel name='history' class='q-pa-none'>
          <history-tab-panel :id='vehicle._id' type='vehicles' />
        </q-tab-panel>
      </q-tab-panels>
    </template>
    <loading-card v-else :loading='loading' :message='$t("vehicles.loading_one")' />
    <edit-vehicle-dialog ref='editDialogRef' />
  </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta, useQuasar } from '../../quasar'
import { useVehicleAPI, useVehicleFunctions } from '../composables'

import LoadingCard from '../../core/components/LoadingCard.vue'
import OverviewTabPanel from '../components/OverviewTabPanel.vue'
import HistoryTabPanel from '../../history-log/components/HistoryTabPanel.vue'
import EditVehicleDialog from '../components/EditVehicleDialog.vue'

export default {
  components: {
    LoadingCard,
    OverviewTabPanel,
    HistoryTabPanel,
    EditVehicleDialog
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()
    const { t: $t } = useI18n()
    const { getVehicle, getPrevNextVehicleCode } = useVehicleAPI()
    const { deactivateVehicle, activateVehicle, deleteVehicle } = useVehicleFunctions()

    const vueReactiveDependencies = new Tracker.Dependency()
    const editDialogRef = ref(null)
    const getVehicleQuery = getVehicle.clone()
    const title = ref($t('vehicles.view'))
    const loading = ref(true)
    const activeTab = ref('overview')
    const vehicle = ref(null)
    const availableViews = ['job-cards', 'history']
    let subscription

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

    const goToVehicleCode = (type) => {
      let sortBy = 'code'
      let descending = true

      if ($q.localStorage.has('vehicleListPagination')) {
        const localStoragePagination = $q.localStorage.getItem('vehicleListPagination')

        sortBy = localStoragePagination.sortBy
        descending = localStoragePagination.descending
      }

      getPrevNextVehicleCode({ type, vehicleId: vehicle.value._id, sortBy, descending }).then((response) => {
        router.push({ name: 'ViewVehicle', params: { code: response } })
      })
    }

    watch(route, () => {
      if (route.name === 'ViewVehicle') {
        if (vehicle.value && vehicle.value.code !== route.params.code) {
          vueReactiveDependencies.changed()
        }

        if (route.params.view && availableViews.includes(route.params.view)) {
          activeTab.value = route.params.view
        } else {
          activeTab.value = 'overview'
          router.replace({ name: 'ViewVehicle', params: { code: route.params.code } })
        }
      }
    }, { immediate: true })

    const tracker = Tracker.autorun(() => {
      vueReactiveDependencies.depend()
      loading.value = true

      getVehicleQuery.setParams({ code: route.params.code })
      subscription = getVehicleQuery.subscribe()

      if (subscription.ready()) {
        vehicle.value = getVehicleQuery.fetchOne()

        if (!vehicle.value) {
          router.replace({ name: 'NotFound' })
          return
        }

        title.value = vehicle.value.regNumber
          ? `${vehicle.value.regNumber} - ${vehicle.value.makeModel} - ${$t('vehicles.one')}`
          : `${vehicle.value.makeModel} - ${$t('vehicles.one')}`

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
      vehicle,
      routeTabs,
      activateVehicle,
      deactivateVehicle,
      deleteVehicle,
      handleSwipeRight,
      goToVehicleCode
    }
  }
}
</script>
