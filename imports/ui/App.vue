<template>
  <q-layout view='hHh LpR lFr' class='bg-grey-2'>
    <q-header reveal elevated class='bg-black text-white'>
      <q-toolbar>
        <q-toolbar-title class='gt-sm'>
          <router-link
            :to='{ name: "IndexPage" }'
            class='text-white'
            style='text-decoration: none;'
          >
            {{ settings ? settings.companyNameShort : 'AutoService' }}
          </router-link>
        </q-toolbar-title>
        <q-btn
          @click='leftSidebarOpen = !leftSidebarOpen'
          :icon='leftSidebarOpen ? "sym_o_close" : "sym_o_menu"'
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
              <q-item clickable @click='addContactDialogRef.open()'>
                <q-item-section>
                  <q-item-label>{{ $t('contacts.one') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click='addVehicleDialogRef.open()'>
                <q-item-section>
                  <q-item-label>{{ $t('vehicles.one') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click='addJobCardDialogRef.open()'>
                <q-item-section>
                  <q-item-label>{{ $t('job_cards.one') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click='addServiceDialogRef.open()'>
                <q-item-section>
                  <q-item-label>{{ $t('services.one') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            icon='sym_o_person'
            color='primary'
            dense
            flat
          >
            <q-tooltip>{{ userId }}</q-tooltip>
          </q-btn>
          <q-btn
            @click='$i18n.locale = $i18n.locale === "en" ? "el" : "en"'
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
      v-model='leftSidebarVisible'
      @click='leftSidebarOpen = false'
      :overlay='leftSidebarOpen'
      :width='250'
      behavior='desktop'
      side='left'
      bordered
    >
      <router-view name='leftSidebar' v-slot='{ Component }'>
        <transition name='fade' mode='out-in'>
          <component :is='Component' />
        </transition>
      </router-view>
    </q-drawer>

    <q-drawer
      v-model='rightSidebarVisible'
      side='right'
      behavior='desktop'
      bordered
    >
      <router-view name='rightSidebar' v-slot='{ Component }'>
        <transition name='fade' mode='out-in'>
          <component :is='Component' />
        </transition>
      </router-view>
    </q-drawer>

    <q-page-container>
      <router-view v-slot='{ Component }'>
        <transition name='fade' mode='out-in'>
          <component :is='Component' />
        </transition>
      </router-view>
    </q-page-container>

    <q-footer class='bg-grey-2 text-black'>
    </q-footer>

    <add-contact-dialog ref='addContactDialogRef' />
    <add-vehicle-dialog ref='addVehicleDialogRef' />
    <add-job-card-dialog ref='addJobCardDialogRef' />
    <add-service-dialog ref='addServiceDialogRef' />
  </q-layout>
</template>

<script>
import { ref, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from './quasar'
import { useCoreAPI } from './core/composables'
import { useUsersAPI } from './users/composables'
import AddContactDialog from './contacts/components/AddContactDialog.vue'
import AddVehicleDialog from './vehicles/components/AddVehicleDialog.vue'
import AddJobCardDialog from './job-cards/components/AddJobCardDialog.vue'
import AddServiceDialog from './services/components/AddServiceDialog.vue'

export default {
  components: {
    AddContactDialog,
    AddVehicleDialog,
    AddJobCardDialog,
    AddServiceDialog
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const { t: $t } = useI18n()
    const { settings } = useCoreAPI()
    const { logout: logoutFn, userId } = useUsersAPI()

    const addContactDialogRef = ref(null)
    const addVehicleDialogRef = ref(null)
    const addJobCardDialogRef = ref(null)
    const addServiceDialogRef = ref(null)

    const leftSidebarOpen = ref(false)

    const rightSidebarVisible = computed(() => {
      let sidebar = false
      if (route.matched.length > 0) {
        /*
        route.matched.forEach((match) => {
          if (match.components && match.components.rightSidebar) {
            sidebar = true
            return
          }
        })
        */
        const index = route.matched.findIndex((match) => match.components && match.components.rightSidebar)
        if (index !== -1) {
          sidebar = true
        }
      }
      return $q.screen.gt.sm && sidebar
    })

    const leftSidebarVisible = computed(() => {
      let sidebar = false
      if (route.matched.length > 0) {
        /*
        route.matched.forEach((match) => {
          if (match.components && match.components.leftSidebar) {
            sidebar = true
            return
          }
        })
        */
        const index = route.matched.findIndex((match) => match.components && match.components.leftSidebar)
        if (index !== -1) {
          sidebar = true
        }
      }
      return ($q.screen.gt.sm && sidebar) || leftSidebarOpen.value
    })

    const logout = () => {
      logoutFn().then(() => {
        router.push({ name: 'LoginPage' })
        $q.notify({
          type: 'positive',
          message: $t('users.logout_successful')
        })
      }).catch((error) => {
        console.log(error)
      })
    }

    provide('addContactDialogRef', addContactDialogRef)
    provide('addVehicleDialogRef', addVehicleDialogRef)
    provide('addJobCardDialogRef', addJobCardDialogRef)
    provide('addServiceDialogRef', addServiceDialogRef)

    return {
      settings,
      userId,
      addContactDialogRef,
      addVehicleDialogRef,
      addJobCardDialogRef,
      addServiceDialogRef,
      leftSidebarOpen,
      leftSidebarVisible,
      rightSidebarVisible,
      logout
    }
  }
}
</script>
