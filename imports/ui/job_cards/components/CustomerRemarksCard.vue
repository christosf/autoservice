<script setup>
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  jobCard: {
    type: Object,
    required: true
  }
})

const input = ref('')
const isSubmitted = ref(false)

const editorToolbar = [
  ['undo', 'redo'],
  ['bold', 'italic', 'underline', 'strike'],
  ['unordered', 'ordered']
]

const isBtnDisabled = computed(() => (
  (input.value && input.value.trim() === props.jobCard.customerRemarks)
  || (input.value === '' && !props.jobCard.customerRemarks)
))

const submitForm = () => {

}

watchEffect(() => {
  input.value = props.jobCard.customerRemarks ? props.jobCard.customerRemarks : ''
})
</script>

<template>
  <q-card class='customer-remarks-card' bordered flat>
    <q-card-section class='q-py-sm border-bottom text-h6 text-bold'>
      {{ $t('job_cards.customer_remarks') }}
    </q-card-section>
    <q-card-section class='q-pa-none border-bottom'>
      <q-item
        :to='{ name: "ViewContact", params: { code: props.jobCard.owner.code }}'
        class='q-py-sm'
        clickable
      >
        <q-item-section avatar>
          <q-icon name='sym_o_person' color='primary' />
        </q-item-section>
        <q-item-section class='text-body2'>
          <q-item-label class='text-secondary'>
            {{ props.jobCard.owner.name }}
          </q-item-label>
          <q-item-label class='text-grey'>
            {{ props.jobCard.owner.phoneNumber }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section class='q-pa-none' :class='{"border-bottom": !isBtnDisabled}'>
      <q-form @submit.prevent>
        <q-editor
          v-model='input'
          :toolbar='editorToolbar'
          ref='fieldRef'
          min-height='85px'
          flat
        />
      </q-form>
    </q-card-section>
    <q-slide-transition>
      <q-card-section v-show='!isBtnDisabled' class='q-pa-none'>
        <q-btn
          @click='submitForm'
          :label='$t("core.save")'
          :disabled='isBtnDisabled'
          :loading='isSubmitted'
          class='q-ma-sm'
          color='primary'
          icon='sym_o_save'
          padding='xs sm'
          size='13px'
          outline
          no-caps
        />
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<style>
.customer-remarks-card .q-editor__toolbars-container {
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
</style>
