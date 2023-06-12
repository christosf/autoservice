<template>
    <q-page padding>
        <q-card bordered flat>
            <q-card-section>
                <q-btn
                    @click='exportContacts'
                    :label='`${$t("settings.export_contacts")} (JSON)`'
                    download='contacts.json'
                    icon='upgrade'
                    color='primary'
                    no-caps
                />
                <q-btn
                    @click='exportContactsCSV'
                    :label='`${$t("settings.export_contacts")} (CSV)`'
                    download='contacts.json'
                    icon='upgrade'
                    color='primary'
                    no-caps
                />
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { unparse } from 'papaparse'
import { useMeta, exportFile } from '../../quasar'
import { useSettingsApi } from '../composables'

export default {
    setup() {
        const { t: $t } = useI18n()
        const { getExportedContacts } = useSettingsApi()

        const exportContacts = () => {
            getExportedContacts().then(res => {
                exportFile('contacts.json', JSON.stringify(res),
                    { encoding: 'utf-8', mimeType: 'text/json;charset=utf-8;' }
                )
            })
        }

        const exportContactsCSV = () => {
            getExportedContacts().then(res => {
                res.forEach(contact => {
                    Object.values(contact).forEach((value, field) => {
                        console.log(field)
                        console.log(value)
                    })
                })

                /*
                exportFile('contacts.csv', unparse(res),
                    { encoding: 'utf-8', mimeType: 'text/csv;charset=utf-8;' }
                )*/
            })
        }

        useMeta({
            title: $t('settings.content_export')
        })

        return {
            exportContacts,
            exportContactsCSV
        }
    }
}
</script>