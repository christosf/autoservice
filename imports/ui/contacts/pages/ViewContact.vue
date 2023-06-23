<template>
    <q-page padding>
        <q-card bordered flat>
            <template v-if='contact'>
                <q-card-section class='q-pa-none'>
                    <q-toolbar>
                        <q-icon :name='isCompany? "domain" : "person"' color='primary' size='36px' class='q-mr-md q-ml-xs' />
                        <div class='left q-py-sm'>
                            <div class='text-h6'>{{ contact.name }}</div>
                            <div class='text-caption'>{{ `${$t('core.code')}: ${contact.code}` }}</div>
                        </div>
                        <q-space />
                        <div>
                            <q-icon name='more_vert' color='primary' size='26px' />
                        </div>
                    </q-toolbar>                    
                </q-card-section>
                <q-separator />
                <q-tabs
                    align='left'
                    active-color='primary'
                    inline-label
                    no-caps
                >
                    <q-route-tab
                        :to='{ name: "ViewContact", params: { code: contact.code }}'
                        :label='$t("core.overview")'
                        icon='dataset'
                    />
                    <q-route-tab
                        v-if='contact.vehiclesCount > 0'
                        :to='{ name: "ViewContact", params: { code: contact.code }, query: { view: "vehicles" }}'
                        :label='$t("vehicles.many")'
                        icon='commute'
                    />
                    <q-route-tab
                        :to='{ name: "ViewContact", params: { code: contact.code }, query: { view: "notes" }}'
                        :label='$t("core.notes")'
                        icon='notes'
                    />
                    <q-route-tab
                        :to='{ name: "ViewContact", params: { code: contact.code }, query: { view: "history" }}'
                        :label='$t("core.history")'
                        icon='history'
                    />
                </q-tabs>
                <q-separator />
                <q-tab-panels
                    v-model='activeTab'
                    transition-prev='fade'
                    transition-next='fade'
                    animated
                >
                    <q-tab-panel name='overview'>
                        <pre>{{ contact }}</pre>
                    </q-tab-panel>
                    <q-tab-panel name='vehicles'>
                        <q-table :rows='contact.vehicles' flat bordered />
                    </q-tab-panel>
                    <q-tab-panel name='notes'>
                        <q-input
                            v-model='notes'
                            :label='$t("core.notes")'
                            :autofocus='$q.platform.is.desktop'
                            input-style='min-height: 100px;'
                            ref='notesFieldRef'
                            type='textarea'
                            maxlength='2000'
                            counter
                            autogrow
                            outlined
                        />
                        <div class='q-mt-xs q-gutter-sm'>
                            <q-btn
                                @click='updateNotes'
                                :label='$t("core.save")'
                                :disabled='notesBtnDisabled'
                                :loading='notesUpdateSubmitted'
                                color='primary'
                                icon='save'
                                class='q-mt-sm'
                                no-caps
                            />
                            <q-btn
                                @click='resetNotes'
                                :label='$t("core.reset")'
                                :disabled='notesBtnDisabled'
                                :loading='notesUpdateSubmitted'
                                color='secondary'
                                icon='undo'
                                class='q-mt-sm'
                                outline
                                no-caps
                            />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name='history'>
                        <q-table :rows='contact.history' flat bordered />
                    </q-tab-panel>
                </q-tab-panels>
            </template>
            <q-card-section v-else class='q-py-xl'>
                <q-inner-loading :showing='loading'>
                    <q-spinner-ball size='50px' color='primary'  />
                </q-inner-loading>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useContactsApi } from '../composables'

export default {
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { t: $t } = useI18n()
        const {
            ContactTypesEnum,
            getContact,
            updateNotes: updateNotesFn
        } = useContactsApi()

        const vueReactiveDependencies = new Tracker.Dependency
        const notesFieldRef = ref(null)
        
        const title = ref($t('contacts.view'))
        const loading = ref(true)
        const activeTab = ref('overview')
        const contact = ref(null)
        const notes = ref('')
        const notesUpdateSubmitted = ref(false)

        const notesBtnDisabled = computed(() =>
            notes.value.trim() === contact.value.notes
            || (notes.value === '' && !contact.value.notes)
        )

        const isCompany = computed(() => contact.value.type === ContactTypesEnum.COMPANY)

        const updateNotes = () => {
            notesUpdateSubmitted.value = true

            updateNotesFn({ _id: contact.value._id, notes: notes.value }).then(response => {
                const { updated } = response

                if (updated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('core.notes_update_successful')
                    })
                }
                notesUpdateSubmitted.value = false
                notesFieldRef.value.focus()
            })
        }

        const resetNotes = () => {
            notes.value = contact.value.notes
            notesFieldRef.value.focus()
        }

        watch(route, () => {
            if (route.name === 'ViewContact') {

                if (contact.value && contact.value.code !== route.params.code) {
                    vueReactiveDependencies.changed()
                }

                const availableViews = ['vehicles', 'notes', 'history']
                if (route.query.view && availableViews.includes(route.query.view)) {
                    activeTab.value = route.query.view
                } else {
                    activeTab.value = 'overview'
                    router.replace({ name: 'ViewContact', params: { code: route.params.code }})
                }
            }
        }, { immediate: true })

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
                    return
                }

                notes.value = contact.value.notes ? contact.value.notes : ''
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
            notesFieldRef,
            loading,
            activeTab,
            contact,
            notes,
            notesUpdateSubmitted,
            notesBtnDisabled,
            isCompany,
            updateNotes,
            resetNotes
        }
    }
}
</script>