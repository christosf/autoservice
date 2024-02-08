import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format as formatDate } from 'date-fns'
import { enUS, el } from 'date-fns/locale'
import { useQuasar } from '../../quasar'
import { useCoreAPI } from './index'

export default function useCoreFunctions() {
  const $q = useQuasar()
  const { t: $t, locale } = useI18n()
  const { phoneNumberRegex } = useCoreAPI()

  const selectedLocale = computed(() => {
    if (locale.value === 'el') {
      return el
    }
    return enUS
  })

  const isPhoneNumberValid = (phone) => phoneNumberRegex.test(phone)

  const filterInputDigitsOnly = (event) => {
    const { ctrlKey, shiftKey, key, keyCode } = event

    const allowedKeys = ['Backspace', 'Enter', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight']
    const ctrlAll = (ctrlKey && key === 'a') || (ctrlKey && key === 'A')
    const ctrlC = (ctrlKey && key === 'c') || (ctrlKey && key === 'C')
    const ctrlV = (ctrlKey && key === 'v') || (ctrlKey && key === 'V')

    if (
      !(
        (keyCode > 47 && keyCode < 58 && !shiftKey) || (keyCode > 95 && keyCode < 106 && !shiftKey)
        || allowedKeys.includes(key) || ctrlAll || ctrlC || ctrlV
      )
    ) {
      event.preventDefault()
    }
  }

  const openNewTab = async(route) => {
    const router = (await import('../../../startup/client/router')).default
    const { href } = router.resolve(route)

    window.open(href, '_blank')
  }

  const notifySuccess = (msg) => {
    $q.notify({
      type: 'positive',
      message: msg
    })
  }

  const notifyError = (msg) => {
    $q.notify({
      type: 'negative',
      message: msg || $t('core.msg_error_occured')
    })
  }

  // eslint-disable-next-line no-console
  const consoleLog = (error) => console.log(error)

  const changeLanguage = (languange) => {
    import(`../../../locales/quasar_${languange}.js`).then((lang) => {
      $q.lang.set(lang.default)
    })
    locale.value = languange
  }

  const localizedFormat = ({ date, format }) => formatDate(date, format, { locale: selectedLocale.value })

  const unsavedChangesDialog = ({ msg }) => (
    $q.dialog({
      title: $t('core.unsaved_changes'),
      message: msg,
      persistent: true,
      ok: {
        label: $t('core.stay_on_page'),
        color: 'positive',
        icon: 'sym_o_source_notes',
        outline: true,
        noCaps: true
      },
      cancel: {
        label: $t('core.leave'),
        color: 'negative',
        icon: 'sym_o_variable_remove',
        outline: true,
        noCaps: true
      }
    })
  )

  return {
    phoneNumberRegex,
    isPhoneNumberValid,
    filterInputDigitsOnly,
    consoleLog,
    openNewTab,
    notifyError,
    notifySuccess,
    changeLanguage,
    localizedFormat,
    unsavedChangesDialog
  }
}
