<template>
    <button class="btn btn-sm text-info" @click="toggle(info)" v-if="false">
        <i class="fa fa-info-circle"></i>
    </button>
</template>

<script setup>
import { defineProps } from 'vue'
import { toggle } from './Info.vue'

const { info } = defineProps({
    info: String
})

</script>