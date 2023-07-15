<template>
    <q-page padding>
        <q-card bordered flat>
            <q-card-section class='text-h4 text-bold'>
                {{ $t('contacts.settings') }}
            </q-card-section>
            <q-separator />
            <q-card-section class='q-gutter-sm'>
                <q-table
                    :loading='loading'
                    :columns='contactTagColumns'
                    :rows='contactTags'
                    :rows-per-page-options='[10]'
                    id='contact-tags-table'
                    hide-header
                    bordered
                    flat
                >
                    <template #top>
                        <div class='text-h6 text-bold'>{{ $t('core.tags') }}</div>
                    </template>
                    <template #header-cell='props'>
                        <q-th :props='props' :class='props.col.classes'>
                            {{ props.col.label ? $t(props.col.label) : '' }}
                        </q-th>
                    </template>
                    <template #body-cell-isActive='props'>
                        <q-td :props='props' class='q-px-xl' auto-width>
                            <div
                                :style='{
                                    fontSize: "32px",
                                    color: props.value ? "green" : "red",
                                    lineHeight: 0.8,
                                    cursor: "default"
                                }'
                            >
                                <span>&#x2022;</span>
                                <q-tooltip anchor='top middle' self='bottom middle'>{{ props.value ? $t('core.active') : $t('core.inactive') }}</q-tooltip>
                            </div>
                        </q-td>
                    </template>
                    <template #body-cell-tag='props'>
                        <q-td :props='props'>
                            <q-chip :label='props.value' :style='{ backgroundColor: props.row.color, color: brightness(props.row.color) < 128 ? "white" : "black" }' square />
                        </q-td>
                    </template>
                    <template #body-cell-operations='props'>
                        <q-td :props='props' auto-width>
                            
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { colors } from '../../quasar'
import { useSettingAPI } from '../../settings/composables'
import { useErrorLogAPI } from '../../error-log/composables'

export default {
    setup() {
        const route = useRoute()
        const { brightness } = colors
        const { getContactSettings } = useSettingAPI()
        const { insertErrorLog } = useErrorLogAPI()

        const query = getContactSettings.clone()
        const loading = ref(false)
        const contactSettings = ref(null)

        const contactTagColumns = [
            {
                name: 'isActive',
                field: 'isActive',
                align: 'center'
            },
            {
                name: 'tag',
                label: 'core.name',
                field: 'value',
                align: 'left'
            },
            {
                name: 'operations',
                align: 'right',
                classes: 'operations'
            }
        ]

        const contactTags = computed(() => contactSettings.value ? contactSettings.value.contactTags : [])

        onMounted(() => {
            loading.value = true

            query.fetchOne((error, response) => {
                if (error) {
                    insertErrorLog({
                        location: 'getContactSettingsQuery',
                        path: route.value.fullPath,
                        metadata: error
                    })
                    return
                }
                contactSettings.value = response
                loading.value = false
            })
        })

        return {
            brightness,
            loading,
            contactTagColumns,
            contactTags
        }
    }
}
</script>

<style>
#contact-tags-table.q-table__card .q-table__top {
    border-bottom: 1px solid rgba(0,0,0,0.1);
}
</style>
