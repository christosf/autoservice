<template>
    <q-page padding>
        <q-card bordered flat>
            <template v-if='contact'>
                <q-card-section class='q-pa-none'>
                    <q-toolbar>
                        <q-icon name='person' color='primary' size='24px' />
                        <div class='text-h6'>
                            {{ contact.name }}
                        </div>
                        <q-space />
                        <div>on the right</div>
                    </q-toolbar>
                    
                </q-card-section>
                <q-card-section>
                    <pre>{{ contact }}</pre>
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
import { useContactsApi } from '../composables'

export default {
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { t: $t } = useI18n()
        const {
            getContact
        } = useContactsApi()

        const vueReactiveDependencies = new Tracker.Dependency
        
        const title = ref($t('contacts.view'))
        const loading = ref(true)
        const contact = ref(null)

        watch(route, () => vueReactiveDependencies.changed())

        Tracker.autorun(() => {
            vueReactiveDependencies.depend()
            loading.value = true
            
            const query = getContact.clone({
                code: route.params.code
            })
            const subscription = query.subscribe()

            if (subscription.ready()) {
                contact.value = query.fetchOne()
                
                if (!contact.value) {
                    router.push({ name: 'NotFound' })
                }
                
                title.value = `${contact.value.name} (${$t('contacts.one')})`
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
            contact
        }
    }
}
</script>