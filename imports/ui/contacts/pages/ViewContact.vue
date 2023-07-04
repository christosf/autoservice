<template>
    <q-page v-touch-swipe.mouse.right='handleSwipeRight' id='view-contact' class='q-gutter-sm' padding>
        <template v-if='contact'>
            <q-card bordered flat>
                <q-card-section class='q-pa-none'>
                    <q-toolbar>
                        <q-icon :name='isCompany(contact.type) ? "domain" : "person"' color='primary' size='36px' class='q-mr-md q-ml-xs' />
                        <div class='q-my-sm'>
                            <div class='text-h4 text-bold q-mb-xs'>{{ contact.name }}</div>
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
                    @touchstart.stop
                    @mousedown.stop
                    align='left'
                    active-color='primary'
                    inline-label
                    no-caps
                >
                    <template v-for='tab in routeTabs'>
                        <q-route-tab
                            v-if='tab.name === "vehicles" ? contact.vehicles.length > 0 : true'
                            :to='{ name: "ViewContact", params: { code: contact.code }, query: tab.query ? { view: tab.query } : undefined}'
                            :label='tab.label'
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
                    <div class='row q-col-gutter-sm'>
                        <div class='col-xs-12 col-sm-6'>
                            <div class='q-gutter-sm'>
                                <q-card v-if='$q.screen.lt.sm' bordered flat>
                                    <q-card-section>
                                        <div class='text-h6 text-bold q-mb-xs'>{{ $t('contacts.balance') }}</div>
                                        <div class='text-body1'>
                                            <template v-if='contact.balance'>&euro; {{ contact.balance }}</template>
                                            <span v-else>&euro; 0</span>
                                        </div>
                                    </q-card-section>
                                </q-card>
                                <q-card bordered flat>
                                    <q-card-section class='text-h6 text-bold'>
                                        {{ $t('contacts.contact_phone_numbers') }}
                                    </q-card-section>
                                    <q-separator />
                                    <q-card-section class='q-pa-none'>
                                        <q-list separator>
                                            <q-item :href='`tel:${contact.phoneNumber}`' class='q-py-md' clickable>
                                                <q-item-section avatar>
                                                    <q-icon name='call' color='primary' />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class='text-body1'>{{ contact.phoneNumber }}</q-item-label>
                                                    <q-item-label caption>{{ $t('contacts.main_phone_number') }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                            <q-item v-for='phoneNumber in phoneNumbers' :href='`tel:${phoneNumber.value}`' class='q-py-md' clickable>
                                                <q-item-section avatar>
                                                    <q-icon name='call' color='secondary' />
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
                                            <q-item v-for='email in emails' :href='`mailto:${email.value}`' class='q-py-md' clickable>
                                                <q-item-section avatar>
                                                    <q-icon name='email' color='secondary' />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class='text-body1'>{{ email.value }}</q-item-label>
                                                    <q-item-label caption>{{ email.description }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                            <q-item v-if='emails.length === 0' class='q-py-md'>
                                                <q-item-section>
                                                    <q-item-label class='text-body1 text-italic text-grey'>{{ $t('core.none_1') }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-card-section>
                                </q-card>
                            </div>
                        </div>
                        <div class='col-xs-12 col-sm-6'>
                            <div class='q-gutter-sm'>
                                <q-card v-if='$q.screen.gt.xs' bordered flat>
                                    <q-card-section>
                                        <div class='text-h6 text-bold q-mb-xs'>{{ $t('contacts.balance') }}</div>
                                        <div class='text-body1'>
                                            <template v-if='contact.balance'>&euro; {{ contact.balance }}</template>
                                            <span v-else>&euro; 0</span>
                                        </div>
                                    </q-card-section>
                                </q-card>
                                <q-card bordered flat>
                                    <q-card-section>
                                        <div class='text-h6 text-bold q-mb-xs'>{{ $t('contacts.billing_address') }}</div>
                                        <div class='text-body1'>
                                            <template v-if='billingAddress'>{{ billingAddress }}</template>
                                            <span v-else class='text-italic text-grey'>{{ $t('core.not_set') }}</span>
                                        </div>
                                    </q-card-section>
                                    <template v-if='deliveryAddress'>
                                        <q-separator />
                                        <q-card-section>
                                            <div class='text-h6 text-bold q-mb-xs'>{{ $t('contacts.delivery_address') }}</div>
                                            <div class='text-body1'>{{ deliveryAddress }}</div>
                                        </q-card-section>
                                    </template>
                                </q-card>
                                <q-card bordered flat>
                                    <q-card-section>
                                        <div class='text-h6 text-bold q-mb-xs'>{{ $t('core.tags') }}</div>
                                        <div class='text-body1'>
                                            <q-chip
                                                v-if='contact.tags && contact.tags.length > 0'
                                                v-for='tag in contact.tags'
                                                class='q-ml-none'
                                                square
                                            >
                                                {{ tag }}
                                            </q-chip>
                                            <span v-else class='text-italic text-grey'>{{ $t('core.none_1') }}</span>
                                        </div>
                                    </q-card-section>
                                </q-card>
                                <q-card v-if='faxNumbers.length > 0' bordered flat>
                                    <q-card-section class='text-h6 text-bold'>
                                        {{ $t('contacts.fax') }}
                                    </q-card-section>
                                    <q-separator />
                                    <q-card-section class='q-pa-none'>
                                        <q-list separator>
                                            <q-item v-for='fax in faxNumbers' :href='`tel:${fax.value}`' class='q-py-md' clickable>
                                                <q-item-section avatar>
                                                    <q-icon name='fax' color='secondary' />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class='text-body1'>{{ fax.value }}</q-item-label>
                                                    <q-item-label caption>{{ fax.description }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-card-section>
                                </q-card>
                                <q-card v-if='websites.length > 0' bordered flat>
                                    <q-card-section class='text-h6 text-bold'>
                                        {{ $t('contacts.websites') }}
                                    </q-card-section>
                                    <q-separator />
                                    <q-card-section class='q-pa-none'>
                                        <q-list separator>
                                            <q-item v-for='website in websites' :href='website.value' target='_blank' class='q-py-md' clickable>
                                                <q-item-section avatar>
                                                    <q-icon name='travel_explore' color='secondary' />
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
                </q-tab-panel>
                <q-tab-panel name='vehicles' class='q-pa-none'>
                    <q-table
                        :columns='vehiclesTableColumns'
                        :rows='contact.vehicles'
                        :rows-per-page-options='[0]'
                        hide-pagination
                        bordered
                        flat
                    >
                        <template #header-cell='props'>
                            <q-th :props='props'>
                                {{ props.col.label ? $t(props.col.label) : '' }}
                            </q-th>
                        </template>
                    </q-table>
                </q-tab-panel>
                <q-tab-panel name='notes' class='q-pa-none'>
                    <q-card bordered flat>
                        <q-card-section>
                            <q-form @submit='submitNoteChanges' class='q-gutter-sm'>
                                <q-editor
                                    v-model='notesField'
                                    ref='notesFieldRef'
                                    min-height='100px'
                                />
                                <div class='q-gutter-sm q-ml-none'>
                                    <q-btn
                                        :label='$t("core.save")'
                                        :disabled='isNotesButtonDisabled'
                                        :loading='isNotesFormSubmitted'
                                        type='submit'
                                        color='primary'
                                        icon='save'
                                        no-caps
                                    />
                                    <q-btn
                                        @click='discardNoteChanges'
                                        :label='$q.screen.gt.xs ? $t("core.discard_changes") : ""'
                                        :disabled='isNotesButtonDisabled'
                                        :loading='isNotesFormSubmitted'
                                        color='secondary'
                                        icon='undo'
                                        outline
                                        no-caps
                                    />
                                </div>
                            </q-form>
                        </q-card-section>
                    </q-card>
                </q-tab-panel>
                <q-tab-panel name='history' class='q-pa-none'>
                    <q-card bordered flat>
                        <q-card-section>
                            <q-timeline color='primary' class='q-mx-sm q-my-none'>
                                <q-timeline-entry
                                    v-for='log in historyLog'
                                    :subtitle='formatDate(log.createdAt, "dddd, DD.MM.YYYY - HH:mm")'
                                    :icon='historyLogIcon(log.type)'
                                >
                                    <i18n-t :keypath='`contacts.history_log_${log.type}`' tag='div' class='text-body2' scope='global'>
                                        <router-link :to='{ name: "ViewUser", params: { username: log.createdBy.username }}' class='text-bold text-secondary'>
                                            {{ log.createdBy.username }}
                                        </router-link>
                                    </i18n-t>
                                    <q-btn
                                        v-if='log.type === HistoryLogTypesEnum.UPDATE || log.type === HistoryLogTypesEnum.NOTES_UPDATE'
                                        @click='viewChanges(log.metadata)'
                                        :label='$t("core.view_changes")'
                                        color='primary'
                                        class='q-mt-sm'
                                        size='sm'
                                        outline
                                        no-caps
                                    />
                                </q-timeline-entry>
                            </q-timeline>
                        </q-card-section>
                    </q-card>
                </q-tab-panel>
            </q-tab-panels>
        </template>
        <loading-card v-else :loading='loading' :message='$t("contacts.loading_one")' />
    </q-page>
</template>

<script>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta, date } from '../../quasar'
import { useContactAPI, useContactFunctions } from '../composables'
import { useHistoryLogAPI } from '../../history-log/composables'

import LoadingCard from '../../core/components/LoadingCard.vue'

export default {
    components: {
        LoadingCard
    },
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { t: $t } = useI18n()
        const { formatDate } = date
        
        const { isCompany } = useContactFunctions()

        const {
            HistoryLogTypesEnum,
            getHistoryLog
        } = useHistoryLogAPI()

        const {
            ContactMethodsEnum,
            getContact,
            updateContactNotes
        } = useContactAPI()

        const vueReactiveDependencies = new Tracker.Dependency
        const notesFieldRef = ref(null)
        
        const title = ref($t('contacts.view'))
        const loading = ref(false)
        const activeTab = ref('overview')
        const contact = ref(null)
        const historyLog = ref([])
        const notesField = ref('')
        const isNotesFormSubmitted = ref(false)

        const routeTabs = [
            {
                name: 'overview',
                label: $t('core.overview'),
                icon: 'dataset'
            },
            {
                name: 'vehicles',
                label: $t('vehicles.many'),
                icon: 'commute',
                query: 'vehicles'
            },
            {
                name: 'notes',
                label: $t('core.notes'),
                icon: 'notes',
                query: 'notes'
            },
            {
                name: 'history',
                label: $t('core.history'),
                icon: 'history',
                query: 'history'
            }
        ]

        const vehiclesTableColumns = [
            {
                name: 'regNumber',
                field: 'regNumber',
                label: 'vehicles.reg_number',
                sortable: true,
                align: 'left'
            },
            {
                name: 'make',
                field: 'make',
                label: 'vehicles.make',
                sortable: true,
                align: 'left'
            },
            {
                name: 'model',
                field: 'model',
                label: 'vehicles.model',
                sortable: true,
                align: 'left'
            },
            {
                name: 'code',
                field: 'code',
                label: 'core.code',
                sortable: true,
                align: 'left'
            },
            {
                name: 'operations',
                align: 'right'
            },
        ]

        const phoneNumbers = computed(() => {
            return contact.value.contactMethods.filter(method => method.type === ContactMethodsEnum.PHONE)
        })

        const faxNumbers = computed(() => {
            return contact.value.contactMethods.filter(method => method.type === ContactMethodsEnum.FAX)
        })

        const emails = computed(() => {
            return contact.value.contactMethods.filter(method => method.type === ContactMethodsEnum.EMAIL)
        })

        const websites = computed(() => {
            return contact.value.contactMethods.filter(method => method.type === ContactMethodsEnum.WEBSITE)
        })

        const billingAddress = computed(() => {
            return contact.value.billingAddress
                ? Object.values(contact.value.billingAddress).join(', ')
                : null
        })

        const deliveryAddress = computed(() => {
            return contact.value.deliveryAddress
                ? Object.values(contact.value.deliveryAddress).join(', ')
                : null
        })

        const isNotesButtonDisabled = computed(() =>
            (notesField.value && notesField.value.trim() === contact.value.notes)
            || (notesField.value === '' && !contact.value.notes)
        )

        const historyLogIcon = type => {
            switch (type) {
                case HistoryLogTypesEnum.INSERT: return 'person_add'
                case HistoryLogTypesEnum.UPDATE: return 'update'
                case HistoryLogTypesEnum.NOTES_UPDATE: return 'notes'
                case HistoryLogTypesEnum.ACTIVATION: return 'visibility'
                case HistoryLogTypesEnum.DEACTIVATION: return 'visibility_off'
            }
        }

        const handleSwipeRight = () => router.push({ name: 'ContactList' })

        const submitNoteChanges = () => {
            isNotesFormSubmitted.value = true

            updateContactNotes({ _id: contact.value._id, notes: notesField.value }).then(response => {
                const { updated } = response

                if (updated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('core.notes_update_successful')
                    })
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
                isNotesFormSubmitted.value = false
                notesFieldRef.value.focus()
            })
        }

        const discardNoteChanges = () => {
            notesField.value = contact.value.notes ? contact.value.notes : ''
            notesFieldRef.value.focus()
        }

        const viewChanges = changeList => {
            console.log(changeList)
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

                notesField.value = contact.value.notes ? contact.value.notes : ''
                title.value = `${contact.value.name} (${$t('contacts.one')})`

                const historyQuery = getHistoryLog.clone({ contactId: contact.value._id })
                const historySubscription = historyQuery.subscribe()

                if (historySubscription.ready()) {
                    historyLog.value = historyQuery.fetch()
                    loading.value = false
                }
            }
        })

        useMeta(() => {
            return {
                title: title.value
            }
        })

        return {
            HistoryLogTypesEnum,
            notesFieldRef,
            loading,
            activeTab,
            contact,
            historyLog,
            notesField,
            isNotesFormSubmitted,
            routeTabs,
            vehiclesTableColumns,
            isNotesButtonDisabled,
            billingAddress,
            deliveryAddress,
            phoneNumbers,
            faxNumbers,
            emails,
            websites,
            formatDate,
            isCompany,
            historyLogIcon,
            handleSwipeRight,
            submitNoteChanges,
            discardNoteChanges,
            viewChanges
        }
    }
}
</script>

<style scoped>

</style>
