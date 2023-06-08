<template>
    <q-page padding>
        <q-card bordered flat>
            <template v-if='vehicle'>
                <q-card-section class='q-pa-none'>
                    <q-toolbar>
                        <q-icon name='directions_car' color='primary' size='24px' />
                        <div class='text-h6'>
                            {{ vehicle.makeModel }}
                        </div>
                        <q-space />
                        <div>on the right</div>
                    </q-toolbar>
                    
                </q-card-section>
                <q-card-section>
                    <pre>{{ vehicle }}</pre>
                </q-card-section>
            </template>
            <q-inner-loading :showing='loading'>
                <q-spinner-ball size='50px' color='primary' />
            </q-inner-loading>
        </q-card>
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta } from '../../quasar'
import { useVehiclesApi } from '../composables'

export default {
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { t: $t } = useI18n()
        const {
            getVehicle
        } = useVehiclesApi()

        const vueReactiveDependencies = new Tracker.Dependency
        
        const title = ref($t('vehicles.view'))
        const loading = ref(true)
        const vehicle = ref(null)

        watch(route, () => vueReactiveDependencies.changed())

        Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true
            
            const query = getVehicle.clone({
                code: route.params.code
            })
            const subscription = query.subscribe()

            if (subscription.ready()) {
                vehicle.value = query.fetchOne()
                
                if (!vehicle.value) {
                    router.push({ name: 'NotFound' })
                }
                
                title.value = vehicle.value.regNumber
                    ? `${vehicle.value.regNumber} - ${vehicle.value.makeModel} (${$t('vehicles.one')})`
                    : `${vehicle.value.makeModel} (${$t('vehicles.one')})`
                    
                loading.value = false
            }
        })

        useMeta(() => {
            return {
                title: title.value
            }
        })

        return {
            loading,
            vehicle
        }
    }
}
</script>