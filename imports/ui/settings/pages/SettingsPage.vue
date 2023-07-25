<template>
  <q-page padding>
    <q-card bordered flat>
      <q-card-section class='text-h4 text-bold'>
        {{ $t('settings.general') }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form ref='formRef'>
          <div class='row'>
            <div class='col q-gutter-sm'>
              <q-input
                v-model='form.companyName'
                :label='$t("settings.company_name")'
                :autofocus='$q.platform.is.desktop'
                bottom-slots
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_domain' />
                </template>
              </q-input>
              <q-input
                v-model='form.companyNameShort'
                :label='$t("settings.company_name_short")'
                bottom-slots
                outlined
              >
                <template #prepend>
                  <q-icon name='sym_o_short_text' />
                </template>
              </q-input>
              <q-btn
                @click='submitForm'
                :label='$t("core.save")'
                color='primary'
                no-caps
              />
            </div>
            <div class='col'>

            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, reactive, toRaw, onMounted } from 'vue'
import { useSettingAPI } from '../composables'

export default {
  setup() {
    const { getGeneralSettings, updateGeneralSettings } = useSettingAPI()

    const query = getGeneralSettings.clone()
    const settingsId = ref(null)

    const form = reactive({
      companyName: '',
      companyNameShort: ''
    })

    const submitForm = () => {
      const settings = structuredClone(toRaw(form))

      updateGeneralSettings({ settingsId: settingsId.value, settings }).then((response) => {
        console.log(response)
      })
    }

    onMounted(() => {
      query.fetchOne((error, response) => {
        if (error) {
          return
        }
        settingsId.value = response._id
        form.companyName = response.companyName
        form.companyNameShort = response.companyNameShort
      })
    })

    return {
      form,
      submitForm
    }
  }

}
</script>
