<template>
    <div class="alert alert-info alert-dismissible" v-if="false && display">
        <slot></slot>
        <button type="button" class="btn-close" @click="toggle()" aria-label="Close"></button>
    </div>
</template>

<script>
import { computed, reactive, defineProps } from 'vue'

const infoState = reactive({
    'info-home-funiter': true
})

const toggleInfo = (id) => {
    if (infoState[id]) {
        delete infoState[id]
    } else {
        infoState[id] = true
    }
}

export { toggleInfo as toggle }
</script>

<script setup>



const { infoId } = defineProps({
    infoId: String
})

const toggle = () => {
    toggleInfo(infoId)
}

const display = computed(() => {
    return infoState[infoId] != null 
})
</script>