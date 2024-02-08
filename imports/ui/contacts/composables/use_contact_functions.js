import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from '../../quasar'
import { useContactAPI } from './index'
import { useCoreFunctions } from '../../core/composables'

export default function useContactFunctions() {
  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()
  const { t: $t } = useI18n()
  const { notifySuccess, notifyError, consoleLog } = useCoreFunctions()

  const {
    ContactTypesEnum,
    removeContact: removeContactFn,
    activateContact: activateContactFn,
    deactivateContact: deactivateContactFn
  } = useContactAPI()

  const isCompany = ({ type }) => type === ContactTypesEnum.COMPANY

  const removeContact = ({ contactId }) => {
    $q.dialog({
      title: $t('contacts.delete'),
      message: $t('contacts.msg_delete_prompt'),
      persistent: true,
      ok: { label: $t('core.delete'), color: 'negative', icon: 'sym_o_delete', noCaps: true },
      cancel: { label: $t('core.cancel'), color: 'black', icon: 'sym_o_cancel', flat: true, noCaps: true }
    }).onOk(async() => {
      try {
        const { removed } = await removeContactFn({ contactId })

        if (removed) {
          notifySuccess($t('contacts.msg_delete_successful'))

          if (route.name === 'ViewContact') {
            router.push({ name: 'ContactList' })
          }
        } else {
          notifyError()
        }
      } catch (error) {
        if (error.error === 'associated-job-cards') {
          notifyError($t('contacts.msg_error_associated_job_cards'))
          return
        }
        if (error.error === 'associated-vehicles') {
          notifyError($t('contacts.msg_error_associated_vehicles'))
          return
        }
        notifyError()
        consoleLog(error)
      }
    })
  }

  const activateContact = async({ contactId }) => {
    try {
      const { activated } = await activateContactFn({ contactId })

      if (activated) {
        notifySuccess($t('contacts.msg_activate_successful'))
      } else {
        notifyError()
      }
    } catch (error) {
      notifyError()
      consoleLog(error)
    }
  }

  const deactivateContact = ({ contactId }) => {
    $q.dialog({
      title: $t('contacts.deactivate'),
      message: $t('contacts.msg_deactivate_prompt'),
      persistent: true,
      ok: { label: $t('core.deactivate'), color: 'negative', icon: 'sym_o_visibility_off', noCaps: true },
      cancel: { label: $t('core.cancel'), color: 'black', icon: 'sym_o_cancel', flat: true, noCaps: true }
    }).onOk(async() => {
      try {
        const { deactivated } = await deactivateContactFn({ contactId })

        if (deactivated) {
          notifySuccess($t('contacts.msg_deactivate_successful'))
        } else {
          notifyError()
        }
      } catch (error) {
        notifyError()
        consoleLog(error)
      }
    })
  }

  return {
    isCompany,
    removeContact,
    activateContact,
    deactivateContact
  }
}
