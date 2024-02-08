<script setup>
import { defineModel, ref, computed, nextTick, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  isExists, isAfter, isBefore, set,
  addDays, addHours, addWeeks,
  nextSaturday, nextMonday, lastDayOfMonth
} from 'date-fns'
import { useCoreAPI, useCoreFunctions } from '../../composables'

const model = defineModel({ required: true })
const props = defineProps({ tabindex: Number })
const emit = defineEmits(['keypressTab'])

const { t: $t } = useI18n()
const { convertToDateObject } = useCoreAPI()
const { localizedFormat, notifyError } = useCoreFunctions()

const startDateInputRef = ref(null)
const dueDateInputRef = ref(null)
const startTimeInputRef = ref(null)
const dueTimeInputRef = ref(null)
const datePickerRef = ref(null)

const dialogVisible = ref(false)
const activeField = ref('dueDate')
const datePickerModel = ref(null)
const startTimeEnabled = ref(false)
const dueTimeEnabled = ref(false)

const predefinedOptions = [
  {
    label: $t('core.today'),
    caption: localizedFormat({ date: new Date(), format: 'iiii' }),
    value: localizedFormat({ date: new Date(), format: 'dd.MM.yyyy' })
  },
  {
    label: $t('core.later'),
    caption: localizedFormat({ date: set(addHours(new Date(), 3), { minutes: 0 }), format: 'iiii HH:mm' }),
    value: localizedFormat({ date: set(addHours(new Date(), 3), { minutes: 0 }), format: 'dd.MM.yyyy HH:mm' })
  },
  {
    label: $t('core.tomorrow'),
    caption: localizedFormat({ date: addDays(new Date(), 1), format: 'iiii' }),
    value: localizedFormat({ date: addDays(new Date(), 1), format: 'dd.MM.yyyy' })
  },
  {
    separator: true
  },
  {
    label: $t('core.this_weekend'),
    caption: localizedFormat({ date: nextSaturday(new Date()), format: 'iiii' }),
    value: localizedFormat({ date: nextSaturday(new Date()), format: 'dd.MM.yyyy' })
  },
  {
    label: $t('core.next_week'),
    caption: localizedFormat({ date: nextMonday(new Date()), format: 'iiii' }),
    value: localizedFormat({ date: nextMonday(new Date()), format: 'dd.MM.yyyy' })
  },
  {
    label: $t('core.next_month'),
    caption: localizedFormat({ date: addDays(lastDayOfMonth(new Date()), 1), format: 'do MMMM' }),
    value: localizedFormat({ date: addDays(lastDayOfMonth(new Date()), 1), format: 'dd.MM.yyyy' })
  },
  {
    separator: true
  },
  {
    label: $t('core.in_one_week'),
    caption: localizedFormat({ date: addWeeks(new Date(), 1), format: 'do MMMM' }),
    value: localizedFormat({ date: addWeeks(new Date(), 1), format: 'dd.MM.yyyy' })
  },
  {
    label: $t('core.in_two_weeks'),
    caption: localizedFormat({ date: addWeeks(new Date(), 2), format: 'do MMMM' }),
    value: localizedFormat({ date: addWeeks(new Date(), 2), format: 'dd.MM.yyyy' })
  }
]

const selectedDates = computed(() => {
  let startDate
  let dueDate

  if (model.value.startDate) {
    if (model.value.startTime) {
      startDate = localizedFormat({
        date: convertToDateObject({ value: `${model.value.startDate} ${model.value.startTime}` }),
        format: 'EEEE, dd.MM.yyyy - HH:mm'
      })
    } else {
      startDate = localizedFormat({
        date: convertToDateObject({ value: model.value.startDate }),
        format: 'EEEE, dd.MM.yyyy'
      })
    }
  }

  if (model.value.dueDate) {
    if (model.value.dueTime) {
      dueDate = localizedFormat({
        date: convertToDateObject({ value: `${model.value.dueDate} ${model.value.dueTime}` }),
        format: 'EEEE, dd.MM.yyyy - HH:mm'
      })
    } else {
      dueDate = localizedFormat({
        date: convertToDateObject({ value: model.value.dueDate }),
        format: 'EEEE, dd.MM.yyyy'
      })
    }
  }

  if (model.value.startDate && !model.value.dueDate) {
    return `${$t('core.from')} <span class='text-bold'>${startDate}</span>`
  }

  if (model.value.dueDate && !model.value.startDate) {
    return `${$t('core.until')} <span class='text-bold'>${dueDate}</span>`
  }

  if (model.value.startDate && model.value.dueDate) {
    if (model.value.startDate === model.value.dueDate) {
      const date = localizedFormat({
        date: convertToDateObject({ value: model.value.dueDate }),
        format: 'EEEE, dd.MM.yyyy'
      })

      if (model.value.startTime && model.value.dueTime) {
        const startTime = localizedFormat({
          date: convertToDateObject({ value: `${model.value.startDate} ${model.value.startTime}` }),
          format: 'HH:mm'
        })
        const dueTime = localizedFormat({
          date: convertToDateObject({ value: `${model.value.dueDate} ${model.value.dueTime}` }),
          format: 'HH:mm'
        })

        return `<span class='text-bold'>${date}</span> ${$t('core.from_at').toLowerCase()} `
          + `<span class='text-bold'>${startTime}</span> ${$t('core.until_at').toLowerCase()} `
          + `<span class='text-bold'>${dueTime}</span>`
      }

      if (model.value.startTime && !model.value.dueTime) {
        const startTime = localizedFormat({
          date: convertToDateObject({ value: `${model.value.startDate} ${model.value.startTime}` }),
          format: 'HH:mm'
        })

        return `<span class='text-bold'>${date}</span> ${$t('core.from_at').toLowerCase()} `
          + `<span class='text-bold'>${startTime}</span>`
      }

      if (model.value.dueTime && !model.value.startTime) {
        const dueTime = localizedFormat({
          date: convertToDateObject({ value: `${model.value.dueDate} ${model.value.dueTime}` }),
          format: 'HH:mm'
        })

        return `<span class='text-bold'>${date} </span> ${$t('core.until_at').toLowerCase()} `
          + `<span class='text-bold'>${dueTime}</span>`
      }

      return `<span class='text-bold'>${dueDate}</span>`
    }

    return `<span class='text-bold'>${startDate}</span> `
      + `${$t('core.until').toLowerCase()} <span class='text-bold'>${dueDate}</span>`
  }

  return null
})

const availableDateOptions = (date) => {
  if (activeField.value === 'startDate' && model.value.dueDate) {
    const dueDate = convertToDateObject({ value: model.value.dueDate })
    const dateOption = new Date(date.replace('/', '-'))

    if (isAfter(dateOption, dueDate)) {
      return false
    }
  }

  if (activeField.value === 'dueDate' && model.value.startDate) {
    const startDate = convertToDateObject({ value: model.value.startDate })
    const dateOption = new Date(date.replace('/', '-'))

    if (isBefore(dateOption, startDate)) {
      return false
    }
  }

  return true
}

const checkIfDateExists = ({ date }) => isExists(
  parseInt(date.slice(6, 10), 10),
  parseInt(date.slice(3, 5), 10) - 1,
  parseInt(date.slice(0, 2), 10)
)

const checkStartDate = () => {
  if (!model.value.startDate) {
    return
  }

  if (
    (model.value.startDate && model.value.startDate.length !== 10)
    || !checkIfDateExists({ date: model.value.startDate })
  ) {
    model.value.startDate = null
    model.value.startTime = null
    startTimeEnabled.value = false
    notifyError($t('core.msg_start_date_invalid'))
    startDateInputRef.value.focus()
    return
  }

  if (model.value.dueDate) {
    const startDate = convertToDateObject({ value: model.value.startDate })
    const dueDate = convertToDateObject({ value: model.value.dueDate })

    if (isAfter(startDate, dueDate)) {
      model.value.dueDate = null
      model.value.dueTime = null
      dueTimeEnabled.value = false
      dueDateInputRef.value.focus()
    }
  }
}

const checkDueDate = () => {
  if (!model.value.dueDate) {
    return
  }

  if (
    (model.value.dueDate && model.value.dueDate.length !== 10)
    || !checkIfDateExists({ date: model.value.dueDate })
  ) {
    model.value.dueDate = null
    model.value.dueTime = null
    dueTimeEnabled.value = false
    notifyError($t('core.msg_due_date_invalid'))
    dueDateInputRef.value.focus()
    return
  }

  if (model.value.startDate) {
    const startDate = convertToDateObject({ value: model.value.startDate })
    const dueDate = convertToDateObject({ value: model.value.dueDate })

    if (isBefore(dueDate, startDate)) {
      model.value.startDate = model.value.dueDate
    }
  }
}

const checkStartTime = () => {
  if (!model.value.startTime) {
    return
  }

  if (model.value.startTime) {
    if (model.value.startTime.length === 1) {
      model.value.startTime = `0${model.value.startTime}:`
    }
    if (model.value.startTime.length === 3) {
      model.value.startTime += '00'
    }

    const hour = parseInt(model.value.startTime.slice(0, 2), 10)
    const minute = parseInt(model.value.startTime.slice(3, 5), 10)

    if (minute < 0 || minute > 59) {
      model.value.startTime = `${model.value.startTime.slice(0, 3)}00`
    }

    if (minute >= 0 && minute < 10) {
      model.value.startTime = model.value.startTime.slice(0, 3)
      model.value.startTime += minute.toLocaleString('en-US', { minimumIntegerDigits: 2 })
    }

    if (hour === 24) {
      model.value.startTime = `00:${model.value.startTime.slice(3, 5)}`
    }

    if (hour < 0 || hour > 24) {
      model.value.startTime = null
      notifyError($t('core.msg_start_time_invalid'))
      startTimeInputRef.value.focus()
      return
    }

    if (model.value.dueTime && model.value.startDate === model.value.dueDate) {
      if (model.value.startTime >= model.value.dueTime) {
        const newHour = (parseInt(model.value.startTime.slice(0, 2), 10) + 1)
          .toLocaleString('en-US', { minimumIntegerDigits: 2 })

        model.value.dueTime = `${newHour}:${model.value.dueTime.slice(3, 5)}`
      }
    }
  }
}

const checkDueTime = () => {
  if (!model.value.dueTime) {
    return
  }

  if (model.value.dueTime) {
    if (model.value.dueTime.length === 1) {
      model.value.dueTime = `0${model.value.dueTime}:`
    }
    if (model.value.dueTime.length === 3) {
      model.value.dueTime += '00'
    }

    const hour = parseInt(model.value.dueTime.slice(0, 2), 10)
    const minute = parseInt(model.value.dueTime.slice(3, 5), 10)

    if (minute < 0 || minute > 59) {
      model.value.dueTime = `${model.value.dueTime.slice(0, 3)}00`
    }

    if (minute >= 0 && minute < 10) {
      model.value.dueTime = model.value.dueTime.slice(0, 3)
      model.value.dueTime += minute.toLocaleString('en-US', { minimumIntegerDigits: 2 })
    }

    if (hour === 24) {
      model.value.dueTime = `00:${model.value.dueTime.slice(3, 5)}`
    }

    if (hour < 0 || hour > 24) {
      model.value.dueTime = null
      notifyError($t('core.msg_due_time_invalid'))
      dueTimeInputRef.value.focus()
      return
    }

    if (model.value.startTime && model.value.startDate === model.value.dueDate) {
      if (model.value.dueTime <= model.value.startTime) {
        const newHour = (parseInt(model.value.startTime.slice(0, 2), 10) + 1)
          .toLocaleString('en-US', { minimumIntegerDigits: 2 })

        model.value.dueTime = `${newHour}:${model.value.dueTime.slice(3, 5)}`
      }
    }
  }
}

const dateUpdated = () => {
  if (activeField.value === 'startDate' && !model.value.dueDate) {
    dueDateInputRef.value.focus()
  }
  checkStartDate()
  checkDueDate()
  checkStartTime()
  checkDueTime()
}

const datePickerModelUpdated = () => {
  if (activeField.value === 'startDate') {
    model.value.startDate = datePickerModel.value
  } else if (activeField.value === 'dueDate') {
    model.value.dueDate = datePickerModel.value
  }

  if (model.value.startDate && model.value.dueDate) {
    datePickerModel.value = { from: model.value.startDate, to: model.value.dueDate }
  }
  dateUpdated()
}

const selectPredefinedOption = (option) => {
  if (option.length === 16) {
    model.value[activeField.value] = option.slice(0, 10)
    model.value[activeField.value === 'startDate' ? 'startTime' : 'dueTime'] = option.slice(11, 16)

    if (activeField.value === 'startDate') {
      startTimeEnabled.value = true
    }
    if (activeField.value === 'dueDate') {
      dueTimeEnabled.value = true
    }
  } else {
    model.value[activeField.value] = option
  }
  dateUpdated()
}

const dateInputFocused = ({ field }) => {
  activeField.value = field
}

const dateInputCleared = ({ field }) => {
  activeField.value = field

  if (field === 'startDate') {
    startTimeEnabled.value = false
    model.value.startTime = null
  }
  if (field === 'dueDate') {
    dueTimeEnabled.value = false
    model.value.dueTime = null
  }
}

const dateInputLabelColor = ({ field }) => (activeField.value === field ? 'primary' : 'black')

const dateInputIconColor = ({ field }) => (activeField.value === field ? 'primary' : 'secondary')

const dateInputClearable = ({ field }) => (model.value[field] && model.value[field].length === 10)

const addStartTime = () => {
  startTimeEnabled.value = true
  nextTick(() => {
    startTimeInputRef.value.focus()
  })
}

const addDueTime = () => {
  dueTimeEnabled.value = true
  nextTick(() => {
    dueTimeInputRef.value.focus()
  })
}

const handleKeydown = (event) => {
  if (event.code === 'Enter') {
    dialogVisible.value = true
    return
  }

  if (event.code === 'Tab') {
    event.preventDefault()
    emit('keypressTab')
  }
}

watchEffect(() => {
  if (model.value.startDate && model.value.dueDate) {
    datePickerModel.value = { from: model.value.startDate, to: model.value.dueDate }

    if (model.value.startDate === model.value.dueDate) {
      datePickerModel.value = model.value.dueDate
    }
    return
  }

  if (model.value.dueDate && !model.value.startDate) {
    datePickerModel.value = model.value.dueDate
    return
  }

  if (model.value.startDate && !model.value.dueDate) {
    datePickerModel.value = model.value.startDate
    return
  }

  datePickerModel.value = null
})
</script>

<template>
  <q-field
    :label='$t("core.date")'
    bottom-slots
    stack-label
    outlined
  >
    <template #prepend>
      <q-icon name='sym_o_calendar_month' />
    </template>
    <template #control>
      <div
        @click='dialogVisible = true'
        @keydown='handleKeydown'
        :tabindex='props.tabindex'
        class='cursor-pointer'
      >
        <span v-if='!dialogVisible && selectedDates' v-html='selectedDates' />
        <span v-else class='date-field-control-select-text text-secondary'>
          {{ $t('core.select_date') }}...
        </span>
      </div>
    </template>
  </q-field>
  <q-dialog v-model='dialogVisible'>
    <q-card id='date-field'>
      <div class='row date-inputs'>
        <div class='col-xs-12 col-sm-6'>
          <div class='start-inputs row items-end q-px-md q-py-xs'>
            <div class='start-date-input'>
              <q-input
                v-model='model.startDate'
                @focus='dateInputFocused({ field: "startDate" })'
                @clear='dateInputCleared({ field: "startDate" })'
                @blur='checkStartDate'
                :label='$t("core.from")'
                :label-color='dateInputLabelColor({ field: "startDate" })'
                :clearable='dateInputClearable({ field: "startDate" })'
                :placeholder='$t("core.date_mask_template")'
                ref='startDateInputRef'
                mask='##.##.####'
                no-error-icon
                hide-bottom-space
                stack-label
                borderless
              >
                <template #prepend>
                  <q-icon name='sym_o_event' :color='dateInputIconColor({ field: "startDate" })' />
                </template>
              </q-input>
            </div>
            <div class='start-time-input'>
              <q-btn
                v-if='!startTimeEnabled && model.startDate && model.startDate.length === 10'
                @click='addStartTime'
                :label='$t("core.time")'
                icon='sym_o_more_time'
                size='sm'
                color='secondary'
                padding='xs'
                class='q-mb-sm'
                no-caps
                outline
              />
              <q-input
                v-show='startTimeEnabled'
                v-model='model.startTime'
                @focus='dateInputFocused({ field: "startDate" })'
                @clear='dateInputFocused({ field: "startDate" })'
                @blur='checkStartTime'
                :placeholder='$t("core.time_mask_template")'
                ref='startTimeInputRef'
                mask='##:##'
                label=''
                clearable
                stack-label
                borderless
              />
            </div>
          </div>
        </div>
        <div class='col-xs-12 col-sm-6'>
          <div class='due-inputs row items-end q-px-md q-py-xs'>
            <div class='due-date-input'>
              <q-input
                v-model='model.dueDate'
                @focus='dateInputFocused({ field: "dueDate" })'
                @clear='dateInputCleared({ field: "dueDate" })'
                @blur='checkDueDate'
                :label='$t("core.to")'
                :label-color='dateInputLabelColor({ field: "dueDate" })'
                :clearable='dateInputClearable({ field: "dueDate" })'
                :placeholder='$t("core.date_mask_template")'
                ref='dueDateInputRef'
                mask='##.##.####'
                no-error-icon
                hide-bottom-space
                autofocus
                stack-label
                borderless
              >
                <template #prepend>
                  <q-icon
                    name='sym_o_event_upcoming' :color='dateInputIconColor({ field: "dueDate" })' />
                </template>
              </q-input>
            </div>
            <div class='due-time-input'>
              <q-btn
                v-if='!dueTimeEnabled && model.dueDate && model.dueDate.length === 10'
                @click='addDueTime'
                :label='$t("core.time")'
                icon='sym_o_more_time'
                size='sm'
                color='secondary'
                padding='xs'
                class='q-mb-sm'
                no-caps
                outline
              />
              <q-input
                v-show='dueTimeEnabled'
                v-model='model.dueTime'
                @focus='dateInputFocused({ field: "dueDate" })'
                @clear='dateInputFocused({ field: "dueDate" })'
                @blur='checkDueTime'
                :placeholder='$t("core.time_mask_template")'
                ref='dueTimeInputRef'
                mask='##:##'
                label=''
                clearable
                stack-label
                borderless
              />
            </div>
          </div>
        </div>
      </div>
      <div class='row justify-center'>
        <div class='predefined-options gt-xs bg-grey-1'>
          <q-list class='q-py-xs' dense>
            <template v-for='item in predefinedOptions' :key='item'>
              <q-separator v-if='item.separator' class='q-my-xs' />
              <q-item v-else @click='selectPredefinedOption(item.value)' clickable>
                <q-item-section>{{ item.label }}</q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ item.caption }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </div>
        <div>
          <q-date
            v-model='datePickerModel'
            @update:model-value='datePickerModelUpdated'
            :options='availableDateOptions'
            ref='datePickerRef'
            mask='DD.MM.YYYY'
            no-unset
            minimal
            square
            flat
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<style>
#date-field {
  max-width: 600px;
}

#date-field .date-inputs {
  border-bottom: 1px solid #dddddd;
}

#date-field .predefined-options {
  width: 240px;
  font-size: 12px;
  border-right: 1px solid #dddddd;
}

#date-field .q-date__view {
  min-height: 280px;
  padding-bottom: 0;
}

#date-field .q-field--float .q-field__label {
  font-weight: 500;
  transform: translateY(-40%) scale(0.8);
}

#date-field .start-inputs {
  border-right: 1px solid #DDDDDD;
}

@media all and (max-width: 600px) {
  #date-field .start-inputs {
    border-bottom: 1px solid #DDDDDD;
    border-right: none;
  }
}

#date-field .start-date-input,
#date-field .due-date-input {
  width: 140px;
}

#date-field .start-time-input,
#date-field .due-time-input {
  width: 80px;
}

#date-field .start-date-input .q-field__append button,
#date-field .due-date-input .q-field__append button {
  position: absolute;
  top: 27px;
  left: 110px;
  margin: 0;
  font-size: 18px;
  color: black;
}

#date-field .start-time-input .q-field__append button,
#date-field .due-time-input .q-field__append button {
  position: absolute;
  top: 27px;
  left: 40px;
  margin: 0;
  font-size: 18px;
  color: black;
}

.date-field-control-select-text {
  font-style: italic;
  font-size: 13px;
}
</style>
