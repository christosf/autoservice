<script setup>
import { ref, nextTick } from 'vue'
import { useQuasar } from '../../quasar'
import JobCardForm from './JobCardForm.vue'

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
const visible = ref(false)

const show = (params) => {
  visible.value = true
  nextTick(() => {
    if (params) {
      formRef.value.setFormParams(params)
    }
  })
}

const hide = () => {
  visible.value = false
}

defineExpose({
  show,
  hide
})
</script>

<template>
  <q-dialog
    v-model='visible'
    :maximized='$q.screen.lt.sm'
    id='job-card-form-dialog'
    no-backdrop-dismiss
  >
    <job-card-form @hide='hide' :type='props.type' ref='formRef' is-dialog />
  </q-dialog>
</template>

<style>
#job-card-form-dialog .q-card {
    width: 100%;
    max-width: 700px;
}
</style>
