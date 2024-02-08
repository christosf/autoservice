import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContactStore = defineStore('contacts', () => {
  const contactToProvide = ref(null)

  const providedContact = computed(() => contactToProvide.value)

  const setProvidedContact = ({ contact }) => {
    contactToProvide.value = contact
  }

  const clearProvidedContact = () => {
    contactToProvide.value = null
  }

  return {
    providedContact,
    setProvidedContact,
    clearProvidedContact
  }
})
