import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { isEmail, isURL } from 'validator'
import { ref } from 'vue'

export function useCoreAPI() {
    const connectionStatus = ref('waiting')

    const reconnectToServer = () => Meteor.reconnect()

    Tracker.autorun(() => connectionStatus.value = Meteor.status().status)

    return {
        connectionStatus,
        reconnectToServer
    }
}

export function useCoreFunctions() {
    const phoneNumberRegex = /^$|^[0-9]{8,20}$/

    const isPhoneNumberValid = phone => phoneNumberRegex.test(phone)

    const filterInputDigitsOnly = event => {
        const allowedKeys = ['Backspace', 'Enter', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight']
        const ctrlC = (event.ctrlKey && event.key === 'c') || (event.ctrlKey && event.key === 'C')
        const ctrlV = (event.ctrlKey && event.key === 'v') || (event.ctrlKey && event.key === 'V')

        if ((isNaN(event.key) && !allowedKeys.includes(event.key) && !ctrlC && !ctrlV) || event.code === 'Space') {
            event.preventDefault()
        }
    }

    return {
        phoneNumberRegex,
        isPhoneNumberValid,
        filterInputDigitsOnly
    }
}

export function useCoreRules() {
    const { phoneNumberRegex } = useCoreFunctions()

    const required = (value, msg) => !!value || msg

    const optionalIfEmpty = (value, field, msg) => (!!value || !field) || msg

    const minLength = (value, length, msg) => (!value || value.length >= length) || msg

    const phoneNumber = (value, msg) => phoneNumberRegex.test(value) || msg

    const email = (value, msg) => isEmail(value) || msg

    const url = (value, msg) => isURL(value) || msg

    return {
        required,
        optionalIfEmpty,
        minLength,
        phoneNumber,
        email,
        url
    }
}
