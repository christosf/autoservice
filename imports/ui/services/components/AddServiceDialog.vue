<template>
    <q-dialog
        v-model='dialogOpen'
        @hide='resetForm'
        :maximized='$q.platform.is.mobile'
        id='add-service-dialog'
        no-backdrop-dismiss
    >
        <q-card>
            <q-card-section class='q-pa-sm'>
                <q-toolbar>
                    <div class='text-h6'>{{ $t('services.add') }}</div>
                    <q-icon name='help' color='secondary' size='20px' class='q-pl-sm'>
                        <q-tooltip anchor='top middle' self='bottom middle'>
                            {{ $t('services.description') }}
                        </q-tooltip>
                    </q-icon>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <transition name='fade' mode='out-in'>
                    <q-form
                        v-if='!serviceAdded'
                        @submit='submitForm'
                        ref='formRef'
                        class='q-col-gutter-md'
                    >
                        <q-input
                            v-model='form.name'
                            @update:model-value='formRef.resetValidation()'
                            :label='$t("services.name")'
                            :placeholder='$t("services.name_example")'
                            :rules='rules.name'
                            :autofocus='$q.platform.is.desktop'
                            lazy-rules='ondemand'
                            input-class='text-uppercase'
                            maxlength='60'
                            bottom-slots
                            label-slot
                            outlined
                        >
                            <template #prepend>
                                <q-icon name='design_services' />
                            </template>
                            <template #label>
                                <span>
                                    {{ $t('services.name') }}
                                </span>
                                <span class='text-red-8 q-pl-xs'>*</span>
                            </template>
                        </q-input>
                        <div class='row q-col-gutter-md'>
                            <div class='col'>
                                <q-input
                                    v-model='form.ratePerHour'
                                    @update:model-value='formRef.resetValidation()'
                                    :label='$t("services.rate_per_hour")'
                                    input-class='text-uppercase'
                                    prefix='€'
                                    type='number'
                                    bottom-slots
                                    label-slot
                                    outlined
                                >
                                    <template #prepend>
                                        <q-icon name='paid' />
                                    </template>
                                </q-input>
                            </div>
                            <div class='col'>
                                <q-input
                                    v-model='form.hours'
                                    @update:model-value='formRef.resetValidation()'
                                    :label='$t("services.man_hours")'
                                    input-class='text-uppercase'
                                    type='number'
                                    step='0.05'
                                    bottom-slots
                                    label-slot
                                    outlined
                                >
                                    <template #prepend>
                                        <q-icon name='timer' />
                                    </template>
                                </q-input>
                            </div>
                        </div>
                        <q-input
                            v-model='form.description'
                            :label='$t("core.description")'
                            type='textarea'
                            maxlength='300'
                            rows='4'
                            input-class='text-uppercase'
                            counter
                            bottom-slots
                            label-slot
                            outlined
                        >
                            <template #prepend>
                                <q-icon name='info' />
                            </template>
                        </q-input>
                        <q-select
                            v-model='form.tags'
                            @filter='filterTags'
                            @new-value='addNewTag'
                            @update:model-value='formRef.resetValidation()'
                            :label='$t("core.tags")'
                            :options='tagsOptionList'
                            input-class='text-uppercase'
                            class='q-mt-none'
                            multiple
                            use-chips
                            use-input
                            fill-input
                            hide-dropdown-icon
                            options-dense
                            bottom-slots
                            outlined
                        >
                            <template #prepend>
                                <q-icon name='sell' />
                            </template>
                        </q-select>
                        <q-field
                            bottom-slots
                            outlined
                        >
                            <q-toggle
                                v-model='form.noVat'
                                :label='$t("services.no_vat")'
                                class='text-black'
                            />
                        </q-field>
                        <div>
                            <q-btn
                                type='submit'
                                :label='$t("core.add")'
                                :loading='formSubmitted'
                                color='primary'
                                icon='add'
                                no-caps
                            />
                        </div>
                    </q-form>
                    <div v-else>
                        <div v-html='$t("services.added_what_next", { service: form.name.toUpperCase() })' class='text-subtitle1' />
                        <div class='q-mt-lg q-gutter-sm'>
                            <q-btn
                                :to='{ name: "ViewService", params: { code: serviceAdded.code }}'
                                :label='$t("services.view")'
                                color='primary'
                                icon='design_services'
                                no-caps
                            />
                            <q-btn
                                @click='resetForm'
                                :label='$t("services.add_new")'
                                color='primary'
                                icon='add'
                                outline
                                no-caps
                            />
                            <q-btn
                                @click='close'
                                :label='$t("core.close")'
                                color='blue-grey-10'
                                icon='cancel'
                                outline
                                no-caps
                            />
                        </div>
                    </div>
                </transition>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, reactive, toRaw, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from '../../quasar'
import { useServicesApi } from '../composables'

export default {
    setup() {
        const $q = useQuasar()
        const { t: $t } = useI18n()

        const {
            addService,
            serviceExists,
            getDistinctFieldValues
        } = useServicesApi()

        const formRef = ref(null)
        const dialogOpen = ref(false)
        const formSubmitted = ref(false)
        const serviceAdded = ref(null)

        const tagsOptionList = ref([])

        const form = reactive({
            name: '',
            ratePerHour: null,
            hours: null,
            description: '',
            tags: [],
            noVat: false
        })

        const rules = {
            name: [
                val => !!val || $t('core.field_required'),
                val => val.length > 2 || $t('core.field_minlength', { count: 3 }),
                val => new Promise(resolve => {
                    serviceExists({ name: val }).then(response => {
                        if (response) {
                            resolve($t('services.already_exists'))
                            return
                        }
                        resolve(true)
                    })
                })
            ]
        }

        const open = () => dialogOpen.value = true

        const close = () => {
            resetForm()
            dialogOpen.value = false
        }
        
        const submitForm = () => {
            formSubmitted.value = true
            const service = structuredClone(toRaw(form))

            service.ratePerHour = Number(service.ratePerHour)
            service.hours = Number(service.hours)

            addService(service).then(response => {
                serviceAdded.value = response
                formSubmitted.value = false
            }).catch(error => {
                $q.notify({
                    type: 'negative',
                    message: $t('core.error_occured')
                })
                formSubmitted.value = false
                console.log(error)
            })
        }

        const resetForm = () => {
            serviceAdded.value = null

            form.name = ''
            form.ratePerHour = null
            form.hours = null
            form.description = ''
            form.tags.splice(0)
            form.noVat = false
        }

        const filterTags = (filter, update) => {
            getDistinctFieldValues({ filter, field: 'tags' }).then(response => {
                update(() => tagsOptionList.value = response)
            })
        }

        const addNewTag = (value, done) => done(value.toUpperCase(), 'add-unique')

        watchEffect(() => {
            tagsOptionList.value = tagsOptionList.value.filter(tag => !form.tags.includes(tag))
        })

        return {
            formRef,
            dialogOpen,
            serviceAdded,
            formSubmitted,
            tagsOptionList,
            form,
            rules,
            open,
            close,
            submitForm,
            resetForm,
            filterTags,
            addNewTag
        }
    }
}
</script>

<style>
#add-service-dialog .q-card {
    width: 100%;
    max-width: 600px;
}
</style>
