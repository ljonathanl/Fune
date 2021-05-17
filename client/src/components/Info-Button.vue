<template>
    <button class="btn btn-sm text-info" type="button" @click="toggle(info)">
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