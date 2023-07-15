<template>
    <q-page v-touch-swipe.mouse.right='handleSwipeRight' class='q-gutter-sm' padding>
        <template v-if='vehicle'>
            <q-card bordered flat>
                <q-card-section class='q-pa-none'>
                    <q-toolbar>
                        <q-icon name='directions_car' color='primary' size='36px' class='q-mr-md q-ml-xs' />
                        <div class='q-my-sm' :class='{ "q-my-md": $q.screen.gt.sm }'>
                            <div class='text-h4 text-bold q-mb-xs'>{{ vehicle.makeModel }}</div>
                            <div class='text-caption'>{{ `${$t('core.code')}: ${vehicle.code}` }}</div>
                        </div>
                        <q-space />
                        <div class='q-gutter-sm'>
                            <q-btn
                                @click='editDialogRef.open(vehicle._id, vehicle.code)'
                                :label='$q.screen.gt.xs ? $t("core.edit") : ""'
                                :dense='$q.screen.lt.sm'
                                color='primary'
                                icon='edit'
                                outline
                                no-caps
                            />
                            <q-icon name='more_vert' color='primary' size='26px' />
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
                            :to='{ name: "ViewVehicle", params: { code: vehicle.code, view: tab.view ? tab.view : undefined }}'
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
import { useMeta } from '../../quasar'
import { useVehicleAPI } from '../composables'

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
        const { t: $t } = useI18n()
        const { getVehicle } = useVehicleAPI()

        const vueReactiveDependencies = new Tracker.Dependency
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
                icon: 'dataset'
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

        const handleSwipeRight = () => router.push({ name: 'VehicleList' })

        watch(route, () => {
            if (route.name === 'ViewVehicle') {
                if (vehicle.value && vehicle.value.code !== route.params.code) {
                    vueReactiveDependencies.changed()
                }

                if (route.params.view && availableViews.includes(route.params.view)) {
                    activeTab.value = route.params.view
                } else {
                    activeTab.value = 'overview'
                    router.replace({ name: 'ViewVehicle', params: { code: route.params.code }})
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

        useMeta(() => {
            return {
                title: title.value
            }
        })

        return {
            editDialogRef,
            loading,
            activeTab,
            vehicle,
            routeTabs,
            handleSwipeRight
        }
    }
}
</script>