<template>
  <slot />
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { defineProps, onMounted } from 'vue'

const { currency, accounts, selectedAccounts } = defineProps({
  currency: Object,
  accounts: Array,
  selectedAccounts: Array,
  autoPlay: Boolean,
})

onMounted(() => {
  if (currency) {
    funiter.updateCurrency(currency)
  }
  if (accounts) {
    funiter.addAccounts(accounts)
  }
  if (selectedAccounts) {
    selectedAccounts.forEach(account => {
      funiter.select(account)
    })
  }
})
</script>

<style>
  .pointer {
    cursor: pointer;
  }
</style>