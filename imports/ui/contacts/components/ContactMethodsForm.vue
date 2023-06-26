<template>
    <div class='q-mb-lg'>
        <q-table
            :title='$t("contacts.contact_methods")'
            :columns='columns'
            :rows='contactForm.contactMethods'
            hide-no-data
            bordered
            flat
        >
            <template #top-row>
                <q-tr>
                    <q-td>{{ $t('contacts.phone') }}</q-td>
                    <q-td v-if='contactForm.phoneNumber'>{{ contactForm.phoneNumber }}</q-td>
                    <q-td v-else class='text-italic text-grey'>{{ $t('core.not_set') }}</q-td>
                    <q-td class='text-italic text-grey'>{{ $t('contacts.main_phone_number') }}</q-td>
                </q-tr>
            </template>
            <template #bottom-row>
                <q-tr>
                    <q-td colspan='3'>
                        <q-btn
                            @click='isDialogOpen = true'
                            :label='$t("contacts.new_method")'
                            color='primary'
                            icon='playlist_add'
                            dense
                            flat
                            no-caps 
                        />
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <q-dialog v-model='isDialogOpen' @hide='close'>
            <q-card class='full-width' style='max-width: 500px;'>
                <q-card-section class='q-pa-xs'>
                    <q-toolbar>
                        <div class='text-h6'>{{ $t('contacts.new_contact_method') }}</div>
                        <q-space />
                        <q-btn icon='close' flat round dense v-close-popup />
                    </q-toolbar>
                </q-card-section>
                <q-separator />
                <q-card-section>
                    <q-form @submit='submitForm' ref='formRef' class='q-gutter-md'>
                        <q-select
                            v-model='form.type'
                            @update:model-value='typeFieldModelUpdate'
                            :options='contactMethodTypes'
                            :options-dense='$q.platform.is.desktop'
                            map-options
                            emit-value
                            bottom-slots
                            label-slot
                            outlined
                        >
                            <template #prepend>
                                <q-icon name='support_agent' />
                            </template>
                            <template #label>
                                <span>
                                    {{ $t('core.type') }}
                                </span>
                                <span class='text-red-8 q-pl-xs'>*</span>
                            </template>
                        </q-select>
                        <q-input
                            v-model='form.value'
                            @keydown='valueFieldKeydown'
                            :autofocus='$q.platform.is.desktop'
                            :rules='valueFieldRules'
                            lazy-rules='ondemand'
                            ref='valueFieldRef'
                            maxlength='100'
                            bottom-slots
                            label-slot
                            outlined
                        >
                            <template #prepend>
                                <q-icon :name='valueFieldIcon' />
                            </template>
                            <template #label>
                                <span>
                                    {{ valueFieldLabel }}
                                </span>
                                <span class='text-red-8 q-pl-xs'>*</span>
                            </template>
                        </q-input>
                        <q-input
                            v-model='form.description'
                            :label='$t("core.description")'
                            input-class='text-uppercase'
                            maxlength='60'
                            bottom-slots
                            outlined
                        >
                            <template #prepend>
                                <q-icon name='badge' />
                            </template>
                        </q-input>
                        <div class='q-gutter-sm q-ml-sm'>
                            <q-btn
                                type='submit'
                                :label='$t("core.add")'
                                color='primary'
                                icon='playlist_add'
                                no-caps
                            />
                            <q-btn
                                @click='close'
                                :label='$t("core.cancel")'
                                color='secondary'
                                icon='cancel'
                                outline
                                no-caps
                            />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { reactive, ref, computed, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { isEmail, isURL } from 'validator'
import { useQuasar } from '../../quasar'
import { useCoreReusables } from '../../core/composables'

export default {
    props: {
        form: Object
    },
    setup(props, context) {
        const { form: contactForm } = props
        const { emit } = context

        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { filterInputDigitsOnly } = useCoreReusables()

        const formRef = ref(null)
        const valueFieldRef = ref(null)

        const isDialogOpen = ref(false)
        const form = reactive({
            type: 'phone',
            value: '',
            description: ''
        })

        const rules = {
            phone: [
                v => !!v || $t('core.field_required'),
                v => /^$|^[0-9]{8,20}$/.test(v) || $t('contacts.phone_number_invalid')
            ],
            email: [
                v => !!v || $t('core.field_required'),
                v => isEmail(v) || $t('contacts.email_invalid')
            ],
            website: [
                v => !!v || $t('core.field_required'),
                v => isURL(v) || $t('contacts.website_invalid')
            ]
        }

        const columns = [
        {
                name: 'type',
                field: 'type',
                label: $t('core.type'),
                format: value => $t(`contacts.${value}`),
                align: 'left'
            },
            {
                name: 'value',
                field: 'value',
                label: $t('core.value'),
                align: 'left'
            },
            {
                name: 'description',
                field: 'description',
                label: $t('core.description'),
                format: value => value.toUpperCase(),
                align: 'left'
            }
        ]

        const contactMethodTypes = [
            {
                value: 'phone',
                label: $t('contacts.phone')
            },
            {
                value: 'email',
                label: $t('contacts.email')
            },
            {
                value: 'fax',
                label: $t('contacts.fax')
            },
            {
                value: 'website',
                label: $t('contacts.website')
            }
        ]

        const valueFieldLabel = computed(() => {
            switch(form.type) {
                case 'phone': return $t('contacts.phone_number')
                case 'email': return $t('contacts.email_address')
                case 'fax': return $t('contacts.fax_number')
                case 'website': return $t('contacts.url_link')
                default: return $t('core.value')
            }
        })

        const valueFieldRules = computed(() => {
            switch(form.type) {
                case 'phone': return rules.phone
                case 'email': return rules.email
                case 'fax': return rules.phone
                case 'website': return rules.website
                default: return []
            }
        })

        const valueFieldIcon = computed(() => {
            switch(form.type) {
                case 'phone': return 'call'
                case 'email': return 'email'
                case 'fax': return 'fax'
                case 'website': return 'http'
                default: return 'contact_mail'
            }
        })

        const typeFieldModelUpdate = () => {
            form.value = ''

            if ($q.platform.is.desktop) {
                valueFieldRef.value.focus()
            }
        }

        const valueFieldKeydown = event => {
            if (form.type === 'phone' || form.type === 'fax') {
                filterInputDigitsOnly(event)
            }
        }

        const close = () => {
            isDialogOpen.value = false
            form.type = 'phone'
            form.value = ''
            form.description = ''
        }

        const submitForm = () => {
            const method = structuredClone(toRaw(form))
            emit('added', method)
            close()
        }

        return {
            contactForm,
            formRef,
            valueFieldRef,
            isDialogOpen,
            form,
            rules,
            columns,
            contactMethodTypes,
            valueFieldLabel,
            valueFieldRules,
            valueFieldIcon,
            typeFieldModelUpdate,
            valueFieldKeydown,
            close,
            submitForm
        }
    }
}
</script>
