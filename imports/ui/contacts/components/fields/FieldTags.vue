<script setup>
import { defineModel, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactAPI } from '../../composables'

const model = defineModel({ required: true })

const { t: $t } = useI18n()
const { getDistinctFieldValues } = useContactAPI()

const optionList = ref([])

const filterOptionList = async(filter, update) => {
  const options = await getDistinctFieldValues({ filter, field: 'tags' })

  update(() => {
    optionList.value = options
  })
}

watchEffect(() => {
  optionList.value = optionList.value.filter((v) => !model.value.includes(v))
})
</script>

<template>
  <q-select
    v-model='model'
    @new-value='(value, done) => done(value, "add-unique")'
    @filter='filterOptionList'
    :label='$t("core.tags")'
    :options='optionList'
    multiple
    use-chips
    use-input
    fill-input
    hide-dropdown-icon
    options-dense
    bottom-slots
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_sell' />
    </template>
    <template #no-option>
      <div class='after-options-slot'>
        <q-item dense>
          <q-item-section>
            <q-item-label class='text-caption'>{{ $t('core.msg_add_new_tag') }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
    <template #after-options>
      <div class='after-options-slot'>
        <q-item dense>
          <q-item-section>
            <q-item-label class='text-caption'>{{ $t('core.msg_add_new_tag') }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
    <template #selected-item='{ index, tabindex, removeAtIndex: remove, opt: tag }'>
      <q-chip @remove="remove(index)" :tabindex="tabindex" class='q-ml-none' removable square dense>
        {{ tag }}
      </q-chip>
    </template>
  </q-select>
</template>
