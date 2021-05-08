<template>
  <slot />
</template>

<script setup>
import funiter from '../lib/funiterStandalone.js'
import { defineProps, onMounted } from 'vue'

const { currency, accounts, selectedAccounts } = defineProps({
  currency: Object,
  accounts: Array,
  selectedAccounts: Array,
  autoPlay: Boolean,
})


if (currency) {
  funiter.updateCurrency(currency)
}
if (accounts) {
  accounts.forEach(account => {
    funiter.createAccount(account)
  })
}
if (selectedAccounts) {
  selectedAccounts.forEach(account => {
    funiter.select(account)
  })
}
</script>

<style>
  .pointer {
    cursor: pointer;
  }
</style>