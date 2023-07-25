import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContactStore = defineStore('contacts', () => {
  const addedContact = ref(null)

  const getAddedContact = computed(() => addedContact.value)

  const resetAddedContact = () => {
    addedContact.value = null
  }

  const setAddedContact = (contact) => {
    addedContact.value = contact
  }

  return {
    getAddedContact,
    resetAddedContact,
    setAddedContact
  }
})
