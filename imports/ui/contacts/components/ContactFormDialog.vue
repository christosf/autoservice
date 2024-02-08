<script setup>
import { ref, nextTick } from 'vue'
import { useQuasar } from '../../quasar'
import ContactForm from './ContactForm.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator(value) {
      return ['insert', 'update'].includes(value.toString())
    }
  }
})

const $q = useQuasar()
const formRef = ref(null)
const isDialogOpen = ref(false)

const show = (params) => {
  isDialogOpen.value = true
  nextTick(() => {
    if (params) {
      formRef.value.setFormParams(params)
    }
  })
}

const hide = () => {
  isDialogOpen.value = false
}

defineExpose({
  show,
  hide
})
</script>

<template>
  <q-dialog
    v-model='isDialogOpen'
    :maximized='$q.screen.lt.sm'
    id='contact-form-dialog'
    no-backdrop-dismiss
  >
    <contact-form @hide='hide' :type='props.type' ref='formRef' is-dialog />
  </q-dialog>
</template>

<style>
#contact-form-dialog .q-card {
    width: 100%;
    max-width: 800px;
}
</style>
