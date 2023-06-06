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
    </q-list>
</template>

<script>
export default {

}
</script>
