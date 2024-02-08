<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, computed, inject, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, useMeta } from '../../quasar'
import { useContactAPI, useContactFunctions } from '../composables'
import { useCoreFunctions } from '../../core/composables'
import ContactFormDialog from '../components/ContactFormDialog.vue'
import HeaderCell from '../../core/components/table/HeaderCell.vue'
import BodyCell from '../components/table/contact_list/BodyCell.vue'
import BodyCellName from '../components/table/contact_list/BodyCellName.vue'
import BodyCellPhoneNumber from '../components/table/contact_list/BodyCellPhoneNumber.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const { getContactListQuery } = useContactAPI()
const { isCompany, removeContact, activateContact, deactivateContact } = useContactFunctions()
const { localizedFormat } = useCoreFunctions()

const insertContactDialogRef = inject('insertContactDialogRef')
const updateContactDialogRef = ref(null)
const filterRef = ref(null)
const vueDependency = new Tracker.Dependency()
const getContactList = getContactListQuery.clone()
const isLoading = ref(true)
const contacts = ref([])
const filter = ref('')
const visibleColumns = ref([])
const availableViews = ['customers', 'suppliers', 'deactivated']

const pagination = ref({
  sortBy: 'updatedAt',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  {
    name: 'type',
    field: 'type',
    required: true,
    align: 'center'
  },
  {
    name: 'name',
    label: 'contacts.name',
    field: 'name',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'phoneNumber',
    label: 'contacts.phone',
    field: 'phoneNumber',
    required: true,
    sortable: true,
    align: 'left'
  },
  {
    name: 'vehicleCount',
    label: 'vehicles.many',
    field: 'vehicleCount',
    sortable: true,
    align: 'left'
  },
  {
    name: 'updatedAt',
    label: 'core.updated_at_short',
    field: 'updatedAt',
    format: (v) => localizedFormat({ date: v, format: 'dd.MM.yyyy - HH:mm' }),
    required: true,
    sortable: true,
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

const title = computed(() => {
  if (route.params.view === 'customers') { return $t('contacts.customers') }
  if (route.params.view === 'suppliers') { return $t('contacts.suppliers') }
  if (route.params.view === 'deactivated') { return $t('contacts.deactivated_contacts') }

  return $t('contacts.many')
})

const handleSwipeRight = () => router.push({ name: 'IndexPage' })

const filterByTag = (tag) => {
  filter.value = tag
  if ($q.platform.is.desktop) {
    nextTick(() => {
      filterRef.value.select()
    })
  }
}

const setLocalStorage = () => {
  $q.localStorage.set('contactListPagination', {
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    rowsPerPage: pagination.value.rowsPerPage
  })
}

const updateContactList = (scope) => {
  pagination.value = scope.pagination
  setLocalStorage()
  getContactList.unsubscribeCount()
  vueDependency.changed()
}

const tracker = Tracker.autorun(() => {
  vueDependency.depend()
  isLoading.value = true

  getContactList.setParams({
    filter: filter.value ? filter.value : '',
    statusFilter: route.params.view ? route.params.view : '',
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
    limit: pagination.value.rowsPerPage,
    skip: (pagination.value.page - 1) * pagination.value.rowsPerPage
  })

  const subscription = getContactList.subscribe()
  const countSubscription = getContactList.subscribeCount()

  if (subscription.ready() && countSubscription.ready()) {
    contacts.value = getContactList.fetch()
    pagination.value.rowsNumber = getContactList.getCount()
    isLoading.value = false
  }
})

watch(route, () => {
  if (route.name === 'ContactList') {
    if (route.params.view && !availableViews.includes(route.params.view.toString())) {
      router.replace({ name: 'ContactList' })
      return
    }

    if (route.params.view === 'customers') {
      visibleColumns.value = ['vehicleCount']
    } else {
      visibleColumns.value = []

      if ($q.localStorage.has('contactListPagination')) {
        const localStoragePagination = $q.localStorage.getItem('contactListPagination')

        if (
          localStoragePagination.sortBy === 'vehicleCount'
          || pagination.value.sortBy === 'vehicleCount'
        ) {
          pagination.value.sortBy = 'updatedAt'
          setLocalStorage()
        }
      }
    }

    getContactList.unsubscribeCount()
    vueDependency.changed()
  }
}, { immediate: true })

onUnmounted(() => {
  getContactList.unsubscribeCount()
  tracker.stop()
})

onMounted(() => {
  if ($q.localStorage.has('contactListPagination')) {
    const localStoragePagination = $q.localStorage.getItem('contactListPagination')

    pagination.value.sortBy = localStoragePagination.sortBy
    pagination.value.descending = localStoragePagination.descending
    pagination.value.rowsPerPage = localStoragePagination.rowsPerPage

    getContactList.unsubscribeCount()
    vueDependency.changed()
  } else {
    setLocalStorage()
  }
})

useMeta(() => ({
  title: title.value
}))
</script>

<template>
  <q-page v-touch-swipe.mouse.right='handleSwipeRight' padding>
    <transition name='fade' mode='out-in'>
      <q-table
        v-model:pagination='pagination'
        @request='updateContactList'
        :rows='contacts'
        :columns='columns'
        :loading='isLoading'
        :filter='filter'
        :visible-columns='visibleColumns'
        :rows-per-page-options='[10,20,30,50]'
        :hide-header='contacts.length < 1'
        :key='route.params.view'
        row-key='_id'
        id='contacts-table'
        binary-state-sort
        bordered
        flat
      >
        <template #top-left>
          <div class='text-h4 text-bold'>{{ title }}</div>
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
              class='search-contacts'
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
          <q-tr v-if='contacts.length > 0 && !route.params.view'>
            <q-td class='gt-xs' />
            <q-td colspan='100%'>
              <q-btn
                @click='insertContactDialogRef.show()'
                :label='`${$t("contacts.add_new")}...`'
                color='primary'
                padding='none'
                size='12px'
                flat
                no-caps
              />
            </q-td>
          </q-tr>
        </template>
        <template #no-data>
          <div class='row items-center q-col-gutter-sm'>
            <q-icon name='sym_o_warning' size='24px' color='secondary' />
            <span class='text-caption'>
              <template v-if='route.params.view && route.params.view === "deactivated"'>
                {{ $t('contacts.msg_no_deactivated') }}
              </template>
              <template v-else-if='route.params.view && route.params.view === "customers"'>
                {{ $t('contacts.msg_no_customers') }}
              </template>
              <template v-else>
                <div class='row'>
                  <span>{{ $t('contacts.msg_no_data') }} </span>
                  <q-btn
                    @click='insertContactDialogRef.show()'
                    :label='`${$t("contacts.add_new")}...`'
                    color='primary'
                    padding='none'
                    class='q-ml-xs'
                    size='12px'
                    flat
                    no-caps
                  />
                </div>
              </template>
            </span>
          </div>
        </template>
        <template #header-cell='props'>
          <header-cell :props='props' />
        </template>
        <template #header-cell-type='props'>
          <header-cell :props='props' class='gt-xs' />
        </template>
        <template #body-cell='props'>
          <body-cell :props='props' />
        </template>
        <template #body-cell-type='props'>
          <q-td :props='props' :class='{"dense": $q.screen.lt.sm}' class='gt-xs' auto-width>
            <router-link :to='{ name: "ViewContact", params: { code: props.row.code }}'>
              <q-icon
                :name='isCompany({ type: props.value }) ? "sym_o_domain" : "sym_o_person"'
                color='primary'
                size='22px'
              >
                <q-tooltip anchor='top middle' self='bottom middle'>
                  {{ isCompany({ type: props.value }) ? $t('contacts.company') : $t('contacts.individual') }}
                </q-tooltip>
              </q-icon>
            </router-link>
          </q-td>
        </template>
        <template #body-cell-name='props'>
          <body-cell-name @filter='filterByTag' :props='props' />
        </template>
        <template #body-cell-phoneNumber='props'>
          <body-cell-phone-number :props='props' />
        </template>
        <template #body-cell-operations='props'>
          <q-td :props='props' auto-width>
            <div class='q-gutter-sm'>
              <template v-if='props.row.isActive'>
                <q-btn
                  @click='updateContactDialogRef.show({
                    contactId: props.row._id,
                    contactCode: props.row.code
                  })'
                  icon='sym_o_edit'
                  color='secondary'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='deactivateContact({ contactId: props.row._id })'
                  icon='sym_o_visibility_off'
                  color='negative'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.deactivate') }}</q-tooltip>
                </q-btn>
              </template>
              <template v-else>
                <q-btn
                  @click='activateContact({ contactId: props.row._id })'
                  icon='sym_o_visibility'
                  color='positive'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.activate') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click='removeContact({ contactId: props.row._id })'
                  icon='sym_o_delete'
                  color='negative'
                  size='sm'
                  outline
                  dense
                >
                  <q-tooltip anchor='top middle' self='bottom middle'>{{ $t('core.delete') }}</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>
      </q-table>
    </transition>
    <contact-form-dialog type='update' ref='updateContactDialogRef' />
  </q-page>
</template>

<style scoped>
#contacts-table .search-contacts {
  width: 300px;
}

#contacts-table .search-contacts.small {
  width: 120px;
}
</style>
