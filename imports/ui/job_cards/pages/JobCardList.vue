<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, inject, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useJobCardAPI, useJobCardFunctions } from '../composables'
import { useCoreFunctions } from '../../core/composables'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { t: $t } = useI18n()
const { getJobCardListQuery, JobCardStatusesEnum } = useJobCardAPI()
const { jobCardStatusLabel, jobCardStatusColor } = useJobCardFunctions()
const { localizedFormat } = useCoreFunctions()

const insertJobCardDialogRef = inject('insertJobCardDialogRef')
const filterRef = ref(null)
const vueDependency = new Tracker.Dependency()
const getJobCardList = getJobCardListQuery.clone()
const isLoading = ref(true)
const jobCards = ref([])
const filter = ref('')
const visibleColumns = ref([])
const availableViews = ['completed', 'canceled']

const rawVisible = ref(false)

const pagination = ref({
  sortBy: 'dueDate',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  {
    name: 'status',
    field: 'status',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'vehicleRegNumber',
    label: 'vehicles.one',
    field: 'vehicle',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'vehicleMakeModel',
    field: 'vehicle',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'owner',
    label: 'vehicles.owner',
    field: 'owner',
    align: 'left'
  },
  {
    name: 'dueDate',
    label: 'core.dates',
    field: 'dueDate',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'tags',
    label: 'core.tags',
    field: 'tags',
    required: true,
    align: 'left'
  },
  {
    name: 'code',
    label: 'core.code',
    field: 'code',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'operations',
    required: true,
    align: 'right',
    classes: 'operations'
  }
]

const handleSwipeRight = () => router.push({ name: 'IndexPage' })

const addTagFilter = (tag) => {
  filter.value = tag
  if ($q.platform.is.desktop) {
    nextTick(() => {
      filterRef.value.select()
    })
  }
}

const setLocalStorage = () => {
  $q.localStorage.set('jobCardListPagination', {
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    rowsPerPage: pagination.value.rowsPerPage
  })
}

const updateJobCardList = (scope) => {
  pagination.value = scope.pagination
  setLocalStorage()
  getJobCardList.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getJobCardList.setParams({
    filter: filter.value ? filter.value : '',
    statusFilter: route.params.view ? route.params.view : '',
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    limit: pagination.value.rowsPerPage,
    skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
  })

  const subscription = getJobCardList.subscribe()
  const countSubscription = getJobCardList.subscribeCount()

  if (subscription.ready() && countSubscription.ready()) {
    jobCards.value = getJobCardList.fetch()
    pagination.value.rowsNumber = getJobCardList.getCount()
    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'JobCardList') {
    if (route.params.view && !availableViews.includes(route.params.view.toString())) {
      router.replace({ name: 'JobCardList' })
      return
    }

    getJobCardList.unsubscribeCount()
    vueDependency.changed()
  }
}, { immediate: true })

watchEffect(() => {
  if ($q.screen.lt.md) {
    visibleColumns.value = []
  } else {
    visibleColumns.value = ['owner']
  }
})

onUnmounted(() => {
  getJobCardList.unsubscribeCount()
  tracker.stop()
})

onMounted(() => {
  if ($q.localStorage.has('jobCardListPagination')) {
    const localStoragePagination = $q.localStorage.getItem('jobCardListPagination')

    pagination.value.sortBy = localStoragePagination.sortBy
    pagination.value.descending = localStoragePagination.descending
    pagination.value.rowsPerPage = localStoragePagination.rowsPerPage

    getJobCardList.unsubscribeCount()
    vueDependency.changed()
  } else {
    setLocalStorage()
  }
})

useMeta(() => ({
  title: $t('job_cards.many')
}))
</script>

<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' padding>
    <transition name='fade' mode='out-in'>
      <q-table
        v-model:pagination='pagination'
        @request='updateJobCardList'
        :rows='jobCards'
        :columns='columns'
        :loading='isLoading'
        :filter='filter'
        :visible-columns='visibleColumns'
        :rows-per-page-options='[10,20,30,50]'
        :hide-header='jobCards.length < 1'
        :key='route.params.view'
        row-key='_id'
        id='job-cards-table'
        binary-state-sort
        bordered
        flat
      >
        <template #top-left>
          <div class='text-h4 text-bold'>{{ $t('job_cards.many') }}</div>
        </template>
        <template #top-right>
          <div class='row q-gutter-sm'>
            <q-input
              v-model='filter'
              :placeholder='`${$t("core.search")}...`'
              :clearable='$q.screen.gt.sm'
              :autofocus='$q.platform.is.desktop'
              :borderless='$q.screen.lt.md'
              :outlined='$q.screen.gt.sm'
              :class='{ "small": $q.screen.lt.md }'
              class='search-job-cards'
              ref='filterRef'
              debounce='400'
              dense
            >
              <template #prepend>
                <q-icon name='sym_o_search' />
              </template>
            </q-input>
          </div>
        </template>
        <template #bottom-row>
          <q-tr v-if='jobCards.length > 0'>
            <q-td colspan='100%'>
              <q-btn
                @click='insertJobCardDialogRef.show()'
                :label='`${$t("job_cards.add_new")}...`'
                color='primary'
                padding='none'
                size='12px'
                class='q-ml-xs'
                flat
                no-caps
              />
            </q-td>
          </q-tr>
        </template>
        <template #no-data>
          <div class='row items-center q-col-gutter-sm'>
            <q-icon name='sym_o_warning' size='24px' color='secondary' />
            <div class='row'>
              <span>{{ $t('job_cards.msg_no_data') }} </span>
              <q-btn
                @click='insertJobCardDialogRef.show()'
                :label='`${$t("job_cards.add_new")}...`'
                color='primary'
                padding='none'
                class='q-ml-xs'
                size='12px'
                flat
                no-caps
              />
            </div>
          </div>
        </template>
        <template #header-cell='props'>
          <q-th :props='props' :class='props.col.classes'>
            {{ props.col.label ? $t(props.col.label) : '' }}
          </q-th>
        </template>
        <template #body-cell='props'>
          <q-td :props='props' auto-width>
            <router-link :to='{ name: "ViewJobCard", params: { code: props.row.code }}' class='text-black'>
              {{ props.value }}
            </router-link>
          </q-td>
        </template>
        <template #body-cell-status='props'>
          <q-td :props='props' auto-width>
            <q-chip
              @click='router.push({ name: "ViewJobCard", params: { code: props.row.code }})'
              :color='jobCardStatusColor(props.value)'
              size='12px'
              class='q-ma-none'
              clickable
              outline
              square
            >
              {{ jobCardStatusLabel(props.value) }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-vehicleRegNumber='props'>
          <q-td :props='props' auto-width>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewJobCard", params: { code: props.row.code }}'
              class='text-black'
            >
              {{ props.value.regNumber }}
            </router-link>
          </q-td>
        </template>
        <template #body-cell-vehicleMakeModel='props'>
          <q-td :props='props' auto-width>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewJobCard", params: { code: props.row.code }}'
              class='text-black'
            >
              {{ props.value.makeModel }}
            </router-link>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewVehicle", params: { code: props.value.code }}'
              class='open-linked-object'
            >
              <q-icon name='sym_o_open_in_new' />
              <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('vehicles.view') }}</q-tooltip>
            </router-link>
          </q-td>
        </template>
        <template #body-cell-owner='props'>
          <q-td :props='props' auto-width>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewJobCard", params: { code: props.row.code }}'
              class='text-black'
            >
              {{ props.value.name }}
            </router-link>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewContact", params: { code: props.value.code }}'
              class='open-linked-object'
            >
              <q-icon name='sym_o_open_in_new' />
              <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('contacts.view') }}</q-tooltip>
            </router-link>
          </q-td>
        </template>
        <template #body-cell-dueDate='props'>
          <q-td :props='props'>
            <router-link
              v-if='props.value'
              :to='{ name: "ViewJobCard", params: { code: props.row.code }}'
              class='text-black'
            >
              {{ localizedFormat({ date: props.value, format: 'dd.MM.yyyy - HH:mm' }) }}
            </router-link>
          </q-td>
        </template>
        <template #body-cell-tags='props'>
          <q-td :props='props'>
            <template v-if='props.value && props.value.length > 0'>
              <q-chip
                v-for='tag in props.value'
                @click='addTagFilter(tag)'
                :label='tag'
                :key='tag'
                clickable
                square
              />
            </template>
          </q-td>
        </template>
        <template #body-cell-operations='props'>
          <q-td :props='props' auto-width>
            <div class='q-gutter-sm'>

            </div>
          </q-td>
        </template>
      </q-table>
    </transition>
    <q-toggle v-model='rawVisible' label='Show raw job cards' class='q-my-md' />
    <q-slide-transition>
      <pre v-show='rawVisible'>{{ jobCards }}</pre>
    </q-slide-transition>
  </q-page>
</template>

<style scoped>
#job-cards-table .search-job-cards {
  width: 300px;
}

#job-cards-table .search-job-cards.small {
  width: 120px;
}

#job-cards-table .open-linked-object {
  transition: all ease-in-out 0.1s;
  opacity: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-left: 4px;
}

#job-cards-table .open-linked-object:hover {
  color: rgba(0, 0, 0, 0.9);
}

#job-cards-table tr:hover .open-linked-object {
  opacity: 1;
}
</style>
