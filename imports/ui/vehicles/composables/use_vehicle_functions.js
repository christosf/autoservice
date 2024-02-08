import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from '../../quasar'
import { useVehicleAPI } from './index'
import { useCoreFunctions } from '../../core/composables'

export default function useVehicleFunctions() {
  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()
  const { t: $t } = useI18n()
  const { notifySuccess, notifyError, consoleLog } = useCoreFunctions()

  const {
    removeVehicle: removeVehicleFn,
    activateVehicle: activateVehicleFn,
    deactivateVehicle: deactivateVehicleFn
  } = useVehicleAPI()

  const removeVehicle = ({ vehicleId }) => {
    $q.dialog({
      title: $t('vehicles.delete'),
      message: $t('vehicles.msg_delete_prompt'),
      persistent: true,
      ok: { label: $t('core.delete'), color: 'negative', icon: 'sym_o_delete', noCaps: true },
      cancel: { label: $t('core.cancel'), color: 'black', icon: 'sym_o_cancel', flat: true, noCaps: true }
    }).onOk(async() => {
      try {
        const { removed } = await removeVehicleFn({ vehicleId })

        if (removed) {
          notifySuccess($t('vehicles.msg_delete_successful'))

          if (route.name === 'ViewVehicle') {
            router.push({ name: 'VehicleList' })
          }
        } else {
          notifyError()
        }
      } catch (error) {
        if (error.error === 'associated-job-cards') {
          notifyError($t('contacts.msg_error_associated_job_cards'))
          return
        }
        notifyError()
        consoleLog(error)
      }
    })
  }

  const activateVehicle = async({ vehicleId }) => {
    try {
      const { activated } = await activateVehicleFn({ vehicleId })

      if (activated) {
        notifySuccess($t('vehicles.msg_activate_successful'))
      } else {
        notifyError()
      }
    } catch (error) {
      notifyError()
      consoleLog(error)
    }
  }

  const deactivateVehicle = ({ vehicleId }) => {
    $q.dialog({
      title: $t('vehicles.deactivate'),
      message: $t('vehicles.msg_deactivate_prompt'),
      persistent: true,
      ok: { label: $t('core.deactivate'), color: 'negative', icon: 'sym_o_visibility_off', noCaps: true },
      cancel: { label: $t('core.cancel'), color: 'black', icon: 'sym_o_cancel', flat: true, noCaps: true }
    }).onOk(async() => {
      try {
        const { deactivated } = await deactivateVehicleFn({ vehicleId })

        if (deactivated) {
          notifySuccess($t('vehicles.msg_deactivate_successful'))
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
    removeVehicle,
    activateVehicle,
    deactivateVehicle
  }
}
