<script setup>
import { Tracker } from 'meteor/tracker'
import { ref, computed, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from './quasar'
import { useSettingAPI } from './settings/composables'
import { useCoreFunctions } from './core/composables'
import { useUserAPI, useUserFunctions } from './users/composables'
import ContactFormDialog from './contacts/components/ContactFormDialog.vue'
import VehicleFormDialog from './vehicles/components/VehicleFormDialog.vue'
import JobCardFormDialog from './job_cards/components/JobCardFormDialog.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const { getSettingsQuery } = useSettingAPI()
const { userId, getCurrentUserQuery } = useUserAPI()
const { changeLanguage } = useCoreFunctions()
const { logout } = useUserFunctions()

const getSettings = getSettingsQuery.clone()
const getCurrentUser = getCurrentUserQuery.clone()
const vueDependency = new Tracker.Dependency()
const isSidebarOpen = ref(false)
const status = ref('idle')
const settings = ref(null)
const user = ref(null)

const insertContactDialogRef = ref(null)
const insertVehicleDialogRef = ref(null)
const insertJobCardDialogRef = ref(null)

const isReady = computed(() => status.value === 'ready')

const sidebarVisibility = computed(() => {
  let sidebar = false
  if (route.matched.length > 0) {
    const index = route.matched.findIndex((match) => match.components && match.components.sidebar)
    if (index !== -1) {
      sidebar = true
    }
  }
  return ($q.screen.gt.sm && sidebar) || isSidebarOpen.value
})

Tracker.autorun(() => {
  vueDependency.depend()
  status.value = 'loading'

  const settingsSub = getSettings.subscribe()
  const userSub = getCurrentUser.subscribe()

  if (settingsSub.ready() && userSub.ready()) {
    settings.value = getSettings.fetchOne()
    user.value = getCurrentUser.fetchOne()
    status.value = 'ready'
  }
})

watch([route, userId], () => {
  vueDependency.changed()

  if (!userId.value) {
    router.push({ name: 'LoginPage' })
  } else if (userId.value && route.meta.access === 'guests-only') {
    router.push({ name: 'IndexPage' })
  }
}, { immediate: true })

provide('insertContactDialogRef', insertContactDialogRef)
provide('insertVehicleDialogRef', insertVehicleDialogRef)
provide('insertJobCardDialogRef', insertJobCardDialogRef)
provide('settings', settings)
provide('user', user)

</script>

<template>
  <q-layout v-if='isReady' view='hHh LpR lfr' class='bg-grey-2'>

    <q-header reveal elevated class='bg-black text-white'>
      <q-toolbar>
        <q-toolbar-title class='gt-sm'>
          <router-link v-if='settings && settings.companyName' :to='{ name: "IndexPage" }' class='text-white'>
            {{ settings.companyName }}
          </router-link>
        </q-toolbar-title>
        <q-btn
          @click='isSidebarOpen = !isSidebarOpen'
          :icon='isSidebarOpen ? "sym_o_close" : "sym_o_menu"'
          class='lt-md'
          color='primary'
          padding='xs'
          round
          flat
        />
        <q-space />
        <div v-if='userId' class='q-gutter-sm'>
          <q-btn-dropdown
            :label='$t("core.add")'
            :menu-offset='[0,5]'
            icon='sym_o_add_box'
            color='primary'
            padding='xs'
            no-caps
          >
            <q-list class='custom-dropdown-menu' separator v-close-popup>
              <q-item @click='insertContactDialogRef.show()' clickable>
                <q-item-section>
                  <q-item-label>{{ $t('contacts.one') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item @click='insertVehicleDialogRef.show()' clickable>
                <q-item-section>
                  <q-item-label>{{ $t('vehicles.one') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item @click='insertJobCardDialogRef.show()' clickable>
                <q-item-section>
                  <q-item-label>{{ $t('job_cards.one') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            :to='{ name: "UserAccount" }'
            icon='sym_o_person'
            color='primary'
            dense
            flat
          >
            <q-tooltip>{{ user.username }}</q-tooltip>
          </q-btn>
          <q-btn
            @click='changeLanguage($i18n.locale === "en" ? "el" : "en")'
            icon='sym_o_language'
            color='primary'
            dense
            flat
          />
          <q-btn
            @click='logout'
            icon='sym_o_logout'
            color='primary'
            dense
            flat
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      @click='isSidebarOpen = false'
      :model-value='sidebarVisibility'
      :overlay='isSidebarOpen'
      :width='250'
      behavior='desktop'
      side='left'
      bordered
    >
      <router-view name='sidebar' v-slot='{ Component }'>
        <transition name='fade' mode='out-in' appear>
          <component :is='Component' />
        </transition>
      </router-view>
    </q-drawer>

    <q-page-container>
      <router-view v-slot='{ Component }'>
        <transition name='fade' mode='out-in' appear>
          <component :is='Component' />
        </transition>
      </router-view>
    </q-page-container>

    <q-footer class='bg-grey-2 q-py-sm q-px-md'>
      <span class='text-caption text-grey'>
        &copy; 2023 CFS Solutions, All rights reserved.
      </span>
    </q-footer>

  </q-layout>

  <q-inner-loading :showing='!isReady'>
    <q-spinner-ball size='50px' color='primary' />
  </q-inner-loading>

  <template v-if='userId'>
    <contact-form-dialog type='insert' ref='insertContactDialogRef' />
    <vehicle-form-dialog type='insert' ref='insertVehicleDialogRef' />
    <job-card-form-dialog type='insert' ref='insertJobCardDialogRef' />
  </template>

</template>
