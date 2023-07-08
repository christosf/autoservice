<template>
    <q-card class='loading-card' bordered flat>
        <q-inner-loading :showing='loading'>
            <q-spinner-ball size='50px' color='primary' />
            <div class='text-h6 q-mt-md'>{{ message }}</div>
        </q-inner-loading>
    </q-card>
</template>

<script>
import { computed } from 'vue'

export default {
    props: {
        loading: Boolean,
        message: String
    },
    setup(props) {
        const loading = computed(() => props.loading)
        const message = computed(() => props.message)

        return {
            loading,
            message
        }
    }
}
</script>

<style scoped>
.q-card.loading-card {
    height: 250px;
}

</style>
