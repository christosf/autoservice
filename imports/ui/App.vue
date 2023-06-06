<template>
    <q-layout view='hHh LpR lFr' class='bg-grey-2'>
        <q-header reveal elevated class='bg-black text-white'>
            <q-toolbar>
                <q-toolbar-title>
                    <router-link
                        :to='{ name: "IndexPage" }'
                        class='text-white'
                        style='text-decoration: none;'
                    >
                        AutoService
                    </router-link>
                </q-toolbar-title>
                <q-space />
                <div v-if='userId' class='q-gutter-sm'>
                    <q-btn-dropdown
                        :label='$t("core.add")'
                        icon='add_box'
                        color='primary'
                        padding='xs'
                        no-caps
                    >
                        <q-list separator dense v-close-popup>
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
                        </q-list>
                    </q-btn-dropdown>
                    <q-btn
                        icon='person'
                        color='primary'
                        dense
                        flat
                    >
                        <q-tooltip>{{ userId }}</q-tooltip>
                    </q-btn>
                    <q-btn
                        @click='logoutFn'
                        icon='logout'
                        color='primary'
                        dense
                        round
                        flat
                    />
                </div>
                
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model='leftSidebar'
            :width='$q.screen.lt.md ? 200 : 250'
            side='left'
            behavior='desktop'
            bordered
        >
            <router-view name='leftSidebar' v-slot='{ Component }'>
				<transition name='fade' mode='out-in'>
		  			<component :is='Component' />
				</transition>
	  		</router-view>
        </q-drawer>

        <q-drawer
            v-model='rightSidebar'
            :width='$q.screen.lt.md ? 200 : 250'
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

        <!--
        <q-footer class='bg-grey-2 text-white'>
            <q-toolbar>
                
            </q-toolbar>
        </q-footer>
        -->
        <add-contact-dialog ref='addContactDialogRef' />
        <add-vehicle-dialog ref='addVehicleDialogRef' />
    </q-layout>
</template>

<script>
import { ref, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from './quasar'
import { useUsers } from './users/composables'
import AddContactDialog from './contacts/components/AddContactDialog.vue'
import AddVehicleDialog from './vehicles/components/AddVehicleDialog.vue'

export default {
    components: {
        AddContactDialog,
        AddVehicleDialog
    },
    setup() {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { t: $t } = useI18n()
        const { logout, userId } = useUsers()

        const addContactDialogRef = ref(null)
        const addVehicleDialogRef = ref(null)
        
        const rightSidebar = computed(() => {
            let sidebar = false
            if (route.matched.length > 0) {
                route.matched.forEach(match => {
                    if (match.components && match.components.rightSidebar) {
                        sidebar = true
                        return
                    } 
                })
            }
            return $q.screen.gt.sm && sidebar
        })
        
        const leftSidebar = computed(() => {
            let sidebar = false
            if (route.matched.length > 0) {
                route.matched.forEach(match => {
                    if (match.components && match.components.leftSidebar) {
                        sidebar = true
                        return
                    } 
                })
            }
            return $q.screen.gt.sm && sidebar
        })

        const logoutFn = () => {
            logout().then(() => {
                router.push({ name: 'LoginPage' })
                $q.notify({
                    type: 'positive',
                    message: $t('users.logout_successful')
                })
            }).catch(error => {
                console.log(error)
            })
        }

        provide('addContactDialogRef', addContactDialogRef)
        provide('addVehicleDialogRef', addVehicleDialogRef)

        return {
            userId,
            addContactDialogRef,
            addVehicleDialogRef,
            leftSidebar,
            rightSidebar,
            logoutFn
        }
    }
}
</script>