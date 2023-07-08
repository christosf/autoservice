<template>
    <div class='q-mb-lg'>
        <draggable
            v-model='contactForm.contactMethods'
            @change='$emit("orderUpdate")'
            item-key='value'
            tag='q-list'
            handle='.handle'
            :component-data='{ bordered: true, separator: true, class: "rounded-borders" }'
        >
            <template #header>
                <q-item class='q-py-md'>
                    <q-item-section avatar>
                        <q-icon name='contact_phone' color='primary' />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class='text-h5'>{{ $t('contacts.contact_methods') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item class='q-py-md'>
                    <q-item-section avatar>
                        <q-icon name='drag_indicator' color='grey-6' disabled />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class='q-mb-xs'>
                            <span class='text-bold'>{{ $t('contacts.phone') }}: </span>
                            <span v-if='contactForm.phoneNumber'>
                                <span>{{ contactForm.phoneNumber }}</span>
                                <span
                                    v-if='!isPhoneNumberValid(contactForm.phoneNumber)'
                                    class='text-negative'
                                >
                                    {{ ` (${$t('core.not_valid')})` }}
                                </span>
                            </span>
                            <span v-else class='text-italic text-grey'>{{ $t('core.not_set') }}</span>
                        </q-item-label>
                        <q-item-label caption>{{ $t('contacts.main_phone_number') }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <div class='q-gutter-sm'>
                            <q-btn
                                @click='$emit("editPhoneNumber")'
                                icon='edit'
                                color='secondary'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </template>
            <template #item='{ element: method, index }'>
                <q-item class='q-py-md'>
                    <q-item-section class='handle' avatar>
                        <q-icon name='drag_indicator' color='secondary' />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class='q-mb-xs'>
                            <span class='text-bold'>{{ $t(`contacts.${method.type}`) }}: </span>
                            <span>{{ method.value }}</span>
                        </q-item-label>
                        <q-item-label v-if='method.description' caption>{{ method.description }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <div class='q-gutter-sm'>
                            <q-btn
                                @click='edit(method, index)'
                                icon='edit'
                                color='secondary'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click='$emit("remove", index)'
                                icon='cancel'
                                color='negative'
                                size='sm'
                                outline
                                dense
                            >
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.remove') }}</q-tooltip>
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </template>
            <template #footer>
                <q-separator />
                <q-btn
                    v-if='contactForm.phoneNumber && isPhoneNumberValid(contactForm.phoneNumber)'
                    @click='isDialogOpen = true'
                    :label='$t("contacts.new_method")'
                    class='q-ma-md'
                    color='primary'
                    icon='playlist_add'
                    outline
                    dense
                    no-caps
                />
                <q-banner v-else class='text-negative'>
                    {{ $t('contacts.add_phone_number_msg') }}
                </q-banner>
            </template>
        </draggable>
        <q-dialog v-model='isDialogOpen' @hide='resetForm'>
            <q-card class='contact-methods-form'>
                <q-card-section class='q-pa-xs'>
                    <q-toolbar>
                        <div class='text-h4 text-bold'>
                            {{ editIndex !== null ? $t('contacts.edit_contact_method') : $t('contacts.new_contact_method') }}
                        </div>
                        <q-space />
                        <q-btn icon='close' flat round dense v-close-popup />
                    </q-toolbar>
                </q-card-section>
                <q-separator />
                <q-card-section>
                    <q-form @submit='submitForm' ref='formRef' class='q-gutter-md'>
                        <q-select
                            v-model='form.type'
                            @update:model-value='atTypeFieldModelUpdate'
                            :options='contactMethodTypesOptionList'
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
                                <span>{{ $t('core.type') }}</span>
                                <span class='text-red-8 q-pl-xs'>*</span>
                            </template>
                        </q-select>
                        <q-input
                            v-model='form.value'
                            @update:model-value='resetFormValidation'
                            @keydown='atValueFieldKeydown'
                            :autofocus='$q.platform.is.desktop'
                            :rules='valueFieldRules'
                            :type='valueFieldInputType'
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
                                <span>{{ valueFieldLabel }}</span>
                                <span class='text-red-8 q-pl-xs'>*</span>
                            </template>
                        </q-input>
                        <q-input
                            v-model='form.description'
                            @update:model-value='resetFormValidation'
                            :label='$t("core.description")'
                            maxlength='80'
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
import { reactive, ref, toRefs, computed, toRaw, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'

import { useQuasar } from '../../quasar'
import { useCoreFunctions, useCoreRules } from '../../core/composables'
import { useContactAPI } from '../composables'

export default {
    components: {
        draggable
    },
    props: {
        form: Object
    },
    setup(props, context) {
        const $q = useQuasar()
        const { t: $t } = useI18n()
        const { emit } = context
        const { form: contactForm } = toRefs(props)

        const {
            ContactMethodsEnum
        } = useContactAPI()

        const {
            isPhoneNumberValid,
            filterInputDigitsOnly
        } = useCoreFunctions()

        const {
            required,
            phoneNumber,
            email,
            url
        } = useCoreRules()

        const formRef = ref(null)
        const valueFieldRef = ref(null)

        const isDialogOpen = ref(false)
        const editIndex = ref(null)
        const contactMethodTypesOptionList = []

        const form = reactive({
            type: ContactMethodsEnum.PHONE,
            value: '',
            description: ''
        })

        const rules = {
            phone: [
                v => required(v, $t('core.field_required')),
                v => phoneNumber(v, $t('contacts.phone_number_invalid')),
                v => valueAlreadyExists(v, $t('contacts.phone_number_exists'), ContactMethodsEnum.PHONE)
            ],
            email: [
                v => required(v, $t('core.field_required')),
                v => email(v, $t('contacts.email_invalid')),
                v => valueAlreadyExists(v, $t('contacts.email_exists'))
            ],
            website: [
                v => required(v, $t('core.field_required')),
                v => url(v, $t('contacts.website_invalid')),
                v => valueAlreadyExists(v, $t('contacts.website_exists'))
            ]
        }

        const valueFieldLabel = computed(() => {
            switch(form.type) {
                case ContactMethodsEnum.PHONE: return $t('contacts.phone_number')
                case ContactMethodsEnum.EMAIL: return $t('contacts.email_address')
                case ContactMethodsEnum.FAX: return $t('contacts.fax_number')
                case ContactMethodsEnum.WEBSITE: return $t('contacts.url_link')
                default: return $t('core.value')
            }
        })

        const valueFieldRules = computed(() => {
            switch(form.type) {
                case ContactMethodsEnum.PHONE: return rules.phone
                case ContactMethodsEnum.EMAIL: return rules.email
                case ContactMethodsEnum.FAX: return rules.phone
                case ContactMethodsEnum.WEBSITE: return rules.website
                default: return []
            }
        })

        const valueFieldIcon = computed(() => {
            switch(form.type) {
                case ContactMethodsEnum.PHONE: return 'call'
                case ContactMethodsEnum.EMAIL: return 'email'
                case ContactMethodsEnum.FAX: return 'fax'
                case ContactMethodsEnum.WEBSITE: return 'travel_explore'
                default: return 'contact_mail'
            }
        })

        const valueFieldInputType = computed(() => {
            switch(form.type) {
                case ContactMethodsEnum.PHONE: return 'tel'
                case ContactMethodsEnum.EMAIL: return 'email'
                case ContactMethodsEnum.FAX: return 'tel'
                case ContactMethodsEnum.WEBSITE: return 'url'
                default: return 'text'
            }
        })

        const valueAlreadyExists = (value, msg, type) => {
            if (type === ContactMethodsEnum.PHONE && value === contactForm.value.phoneNumber) {
                return msg
            }

            let exists = false
            contactForm.value.contactMethods.forEach((item, index) => {
                if (value === item.value && index !== editIndex.value) {
                    exists = true
                }
            })
            if (exists) {
                return msg
            }

            return true
        }

        const resetFormValidation = () => formRef.value.resetValidation()

        const edit = (method, index) => {
            editIndex.value = index

            form.type = method.type
            form.value = method.value
            form.description = method.description

            isDialogOpen.value = true
        }

        const close = () => {
            resetForm()
            isDialogOpen.value = false
        }
        
        const atTypeFieldModelUpdate = () => {
            resetFormValidation()
            form.value = ''

            if ($q.platform.is.desktop) {
                valueFieldRef.value.focus()
            }
        }

        const atValueFieldKeydown = event => {
            if ([ContactMethodsEnum.PHONE, ContactMethodsEnum.FAX].includes(form.type)) {
                filterInputDigitsOnly(event)
            }
        }

        const resetForm = () => {
            editIndex.value = null

            form.type = ContactMethodsEnum.PHONE
            form.value = ''
            form.description = ''
        }

        const submitForm = () => {
            const method = structuredClone(toRaw(form))

            // Only check for null because 0 is accepted as value.
            if (editIndex.value === null) {
                emit('submit', method)
            } else {
                emit('submitEdit', method, editIndex.value)
                editIndex.value = null
            }
            close()
        }

        onBeforeMount(() => {
            Object.values(ContactMethodsEnum).forEach(method => {
                contactMethodTypesOptionList.push({
                    value: method,
                    label: $t(`contacts.${method}`)
                })
            })
        })

        return {
            contactForm,
            formRef,
            valueFieldRef,
            isDialogOpen,
            editIndex,
            form,
            rules,
            contactMethodTypesOptionList,
            valueFieldLabel,
            valueFieldRules,
            valueFieldIcon,
            valueFieldInputType,
            isPhoneNumberValid,
            resetFormValidation,
            edit,
            close,
            atTypeFieldModelUpdate,
            atValueFieldKeydown,
            resetForm,
            submitForm
        }
    }
}
</script>

<style scoped>
.q-card.contact-methods-form {
    width: 100%;
    max-width: 500px;
}
.handle {
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
}
</style>
