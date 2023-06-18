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
                    <div class='text-h6'>{{ title }}</div>
                    <q-space />
                    <q-btn icon='close' flat round dense v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-form
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
                            :label='$t("core.save")'
                            :loading='formSubmitted'
                            color='primary'
                            icon='add'
                            no-caps
                        />
                    </div>
                </q-form>
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
            getServiceEditableFields,
            updateService,
            serviceExists,
            getDistinctFieldValues
        } = useServicesApi()

        const formRef = ref(null)
        const dialogOpen = ref(false)
        const title = ref($t('services.edit'))
        const formSubmitted = ref(false)
        const serviceId = ref(null)
        const serviceCode = ref(null)

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
                    serviceExists({ name: val, excludeId: serviceId.value }).then(response => {
                        if (response) {
                            resolve($t('services.already_exists'))
                            return
                        }
                        resolve(true)
                    })
                })
            ]
        }

        const open = (id, code) => {
            dialogOpen.value = true
            serviceId.value = id
            serviceCode.value = code
            fetchService()
        }

        const close = () => {
            resetForm()
            dialogOpen.value = false
        }
        
        const submitForm = () => {
            formSubmitted.value = true
            const service = structuredClone(toRaw(form))
            service._id = serviceId.value

            service.ratePerHour = Number(service.ratePerHour)
            service.hours = Number(service.hours)

            updateService(service).then(response => {
                const { updated } = response

                if (updated) {
                    $q.notify({
                        type: 'positive',
                        message: $t('services.update_successful')
                    })
                    close()
                } else {
                    $q.notify({
                        type: 'negative',
                        message: $t('core.error_occured')
                    })
                }
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
            serviceId.value = null
            serviceCode.value = null

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

        const fetchService = () => {
            const query = getServiceEditableFields.clone({ id: serviceId.value })
            query.fetchOne((error, service) => {
                if (error) {
                    console.log(error)
                    return
                }

                Object.keys(service).forEach(field => {
                    if (field in form) {
                        form[field] = service[field]
                    }
                })

                title.value = `${$t('core.edit')}: ${serviceCode.value} - ${service.name}`
            })
        }

        watchEffect(() => {
            tagsOptionList.value = tagsOptionList.value.filter(tag => !form.tags.includes(tag))
        })

        return {
            formRef,
            dialogOpen,
            title,
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
