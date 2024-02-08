<script setup>
import { defineModel, ref, onMounted } from 'vue'

const model = defineModel({ required: true })
const props = defineProps({
  submitted: Boolean,
  disabled: Boolean,
  label: String
})
const emit = defineEmits(['submit'])

const notesFieldRef = ref(null)

const editorToolbar = [
  ['undo', 'redo'],
  ['bold', 'italic', 'underline', 'strike'],
  ['unordered', 'ordered']
]

const focus = () => {
  if (notesFieldRef.value) {
    notesFieldRef.value.focus()
  }
}

onMounted(() => {
  focus()
})

defineExpose({
  focus
})
</script>

<template>
  <q-card class='notes-card' bordered flat>
    <q-card-section class='row q-py-sm items-center border-bottom'>
      <span class='text-h6 text-bold'>{{ props.label ? props.label : $t('core.internal_notes') }}</span>
      <q-space />
      <q-icon name='sym_o_info' color='secondary' size='20px' class='cursor-pointer'>
        <q-tooltip anchor='top middle' self='bottom middle'>
          {{ $t('core.msg_internal_notes_info') }}
        </q-tooltip>
      </q-icon>
    </q-card-section>
    <q-card-section class='q-pa-none' :class='{"border-bottom": !props.disabled}'>
      <q-form @submit.prevent>
        <q-editor
          v-model='model'
          :toolbar='editorToolbar'
          ref='notesFieldRef'
          min-height='85px'
          flat
        />
      </q-form>
    </q-card-section>
    <q-slide-transition>
      <q-card-section v-show='!props.disabled' class='q-pa-none'>
        <q-btn
          @click='emit("submit")'
          :label='$t("core.save")'
          :disabled='props.disabled'
          :loading='props.submitted'
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
.notes-card .q-editor__toolbars-container {
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
</style>
