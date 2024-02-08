<script setup>
import { defineModel, ref } from 'vue'

const model = defineModel({ required: true })
const fieldRef = ref(null)

const editorToolbar = [
  ['undo', 'redo'],
  ['bold', 'italic', 'underline', 'strike'],
  ['unordered', 'ordered']
]

const focus = () => {
  fieldRef.value.focus()
}

defineExpose({
  focus
})
</script>

<template>
  <div>
    <q-card class='field-customer-remarks' bordered flat>
      <q-card-section class='header row bg-grey-1'>
        <q-icon name='sym_o_clinical_notes' />
        <div class='title'>{{ $t('job_cards.customer_remarks') }}</div>
      </q-card-section>
      <q-card-section class='q-pa-none'>
        <q-editor
          v-model='model'
          :toolbar='editorToolbar'
          min-height='100px'
          ref='fieldRef'
          flat
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<style>
.field-customer-remarks .header {
  border-bottom: 1px solid rgba(0,0,0,0.12);
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 500;
}

.field-customer-remarks .header .q-icon {
  padding-right: 12px;
  font-size: 24px;
  color: rgba(0,0,0,.54);
}

.field-customer-remarks .header .title {
  line-height: 25px;
}

.field-customer-remarks .q-editor__toolbars-container {
  border-bottom: 1px solid rgba(0,0,0,0.12);
}
</style>
