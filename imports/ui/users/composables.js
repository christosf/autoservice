import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoreFunctions } from '../core/composables'
import { getCurrentUserQuery } from '../../api/users/queries'

export function useUserAPI() {
  const userId = ref(null)

  const changeLanguage = (params) => Meteor.callAsync('users:change_language', params)

  const login = async(params) => {
    const schema = new SimpleSchema({
      username: String,
      password: String
    })
    schema.validate(schema.clean(params))

    const { username, password } = params

    return new Promise((resolve, reject) => {
      Meteor.loginWithPassword(
        username,
        password,
        (error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        }
      )
    })
  }

  const logout = () => new Promise((resolve, reject) => {
    Meteor.logout((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

  Tracker.autorun(() => {
    userId.value = Meteor.userId()
  })

  return {
    // Queries
    getCurrentUserQuery,
    // Functions
    userId,
    login,
    logout,
    changeLanguage
  }
}

export function useUserFunctions() {
  const { t: $t } = useI18n()
  const { logout: logoutFn } = useUserAPI()
  const { notifySuccess } = useCoreFunctions()

  const logout = async() => {
    await logoutFn()
    notifySuccess($t('users.msg_logout_successful'))
  }

  return {
    logout
  }
}
