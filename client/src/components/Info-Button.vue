<template>
    <span class="text-info pl-1 pointer" @click="toggle(info)">
        <i class="fa fa-info-circle"></i>
    </span>
</template>

<script setup>
import { defineProps } from 'vue'
import { toggle } from './Info.vue'

const { info } = defineProps({
    info: String
})

</script>