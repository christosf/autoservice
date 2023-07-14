<template>
    <q-list separator>
        <q-item :to='{ name: "IndexPage" }'>
            <q-item-section avatar>
                <q-icon name='dashboard' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.homepage' )}}
            </q-item-section>
        </q-item>
        <q-expansion-item
            :model-value='$route.meta.group === "Contacts"'
            :header-class='{"q-router-link--active": $route.meta.group === "Contacts"}'
            :to='{ name: "ContactList" }'
            :label='$t("contacts.many")'
            icon='people'
        >
            <q-list class='sub-menu q-mb-sm' dense>
                <q-item :to='{ name: "ContactList", params: { view: "customers" }}'>
                    <q-item-section>
                        <q-item-label>{{ $t('contacts.customers') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item :to='{ name: "ContactList", params: { view: "suppliers" }}'>
                    <q-item-section>
                        <q-item-label>{{ $t('contacts.suppliers') }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item :to='{ name: "ContactList", params: { view: "deactivated" }}'>
                    <q-item-section>
                        <q-item-label>{{ $t('contacts.deactivated') }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-expansion-item>
        <q-expansion-item
            :model-value='$route.meta.group === "Vehicles"'
            :header-class='{"q-router-link--active": $route.meta.group === "Vehicles"}'
            :to='{ name: "VehicleList" }'
            :label='$t("vehicles.many")'
            icon='commute'
        >
            <q-list class='sub-menu q-mb-sm' dense>
                <q-item :to='{ name: "VehicleList", params: { view: "deactivated" }}'>
                    <q-item-section>
                        <q-item-label>{{ $t('vehicles.deactivated') }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-expansion-item>
        <q-item :to='{ name: "JobcardList" }'>
            <q-item-section avatar>
                <q-icon name='build_circle' />
            </q-item-section>
            <q-item-section>
                {{ $t('jobcards.many' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "PartList" }'>
            <q-item-section avatar>
                <q-icon name='category' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.parts' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "ServiceList" }'>
            <q-item-section avatar>
                <q-icon name='design_services' />
            </q-item-section>
            <q-item-section>
                {{ $t('services.many' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "InvoiceList" }'>
            <q-item-section avatar>
                <q-icon name='description' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.invoices' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "ReportList" }'>
            <q-item-section avatar>
                <q-icon name='summarize' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.reports' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "UserList" }'>
            <q-item-section avatar>
                <q-icon name='manage_accounts' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.users' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "SettingsPage" }'>
            <q-item-section avatar>
                <q-icon name='settings' />
            </q-item-section>
            <q-item-section>
                {{ $t('core.settings' )}}
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script>

export default {
    setup() {
        
    }

}
</script>

<style scoped>
.q-list .sub-menu .q-item {
    padding-left: 56px;
    font-size: 13px;
}
</style>