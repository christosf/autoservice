<script setup>
import { defineModel, ref } from 'vue'
import { useQuasar } from '../../../quasar'

const model = defineModel({ required: true })
const type = defineModel('type', { required: true })

const props = defineProps({
  autofocus: Boolean
})

const $q = useQuasar()
const inputRef = ref(null)
</script>

<template>
  <div class='row q-col-gutter-md q-mb-md'>
    <div class='col-xs-12 col-sm-5 q-pt-none'>
      <q-input
        v-model='model'
        :label='$t("job_cards.vehicle_mileage")'
        :autofocus='props.autofocus'
        ref='inputRef'
        mask='#.###.###.###'
        reverse-fill-mask
        unmasked-value
        bottom-slots
        outlined
      >
        <template #prepend>
          <q-icon name='sym_o_confirmation_number' />
        </template>
      </q-input>
    </div>
    <div :class='{"q-pt-none": $q.screen.gt.xs}' class='col-xs-12 col-sm-7'>
      <q-field bottom-slots outlined>
        <q-radio
          v-model='type'
          @update:model-value='inputRef.focus()'
          :label='$t("job_cards.kilometers")'
          val='kms'
          class='text-black q-pr-sm'
        />
        <q-radio
          v-model='type'
          @update:model-value='inputRef.focus()'
          :label='$t("job_cards.miles")'
          val='mls'
          class='text-black'
        />
      </q-field>
    </div>
  </div>
</template>
