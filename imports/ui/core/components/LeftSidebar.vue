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
        <q-item :to='{ name: "ContactList" }'>
            <q-item-section avatar>
                <q-icon name='people' />
            </q-item-section>
            <q-item-section>
                {{ $t('contacts.many' )}}
            </q-item-section>
        </q-item>
        <q-item :to='{ name: "VehicleList" }'>
            <q-item-section avatar>
                <q-icon name='commute' />
            </q-item-section>
            <q-item-section>
                {{ $t('vehicles.many' )}}
            </q-item-section>
        </q-item>
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

}
</script>
