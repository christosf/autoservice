import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { ref } from 'vue'
import SimpleSchema from 'simpl-schema'

export function useUsers() {
    const userId = ref(null)

    const login = credentials => {
        new SimpleSchema({
            username: String,
            password: String
        }).validate(credentials)
        const { username, password } = credentials

        return new Promise((resolve, reject) => {
            Meteor.loginWithPassword(
                username,
                password,
                error => {
                    if (error) {
                        reject(error)
                        return
                    }
                    resolve()
                }
            )
        })
    }

    const logout = () => {
        return new Promise((resolve, reject) => {
            Meteor.logout(error => {
                if (error) {
                    reject(error)
                    return
                }
                resolve()
            })
        })
    }

    Tracker.autorun(() => {
        userId.value = Meteor.userId()
    })

    return {
        userId,
        login,
        logout
    }
}
