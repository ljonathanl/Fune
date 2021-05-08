<template>
    <div>
        <h4 class="text-center">
            <en>transaction</en>
            <fr>transaction</fr>
        </h4>
        <form>
            <div class="input-group">
                <input v-model="tx.value" type="number" step="any" class="form-control text-right" style="width: 80px;">
                <span class="input-group-text"><small>Ü</small></span>
                <label class="input-group-text" for="txFrom">
                    <en> fröm </en>
                    <fr> de </fr> 
                </label>
                <select v-model="tx.from" id="txFrom" class="form-select">
                    <option v-for="account in fromAccounts" :value="account.name" :key="account.name">{{ account.name }}</option>
                </select>
                <label class="input-group-text" for="txTo">
                    <en> tö </en>
                    <fr> à </fr> 
                </label>
                <select v-model="tx.to" id="txTo" class="form-select">
                    <en><option disabled value="">select öne</option></en>
                    <fr><option disabled value="">qüi</option></fr>
                    <option v-for="account in toAccounts" :value="account.name" :key="account.name">{{ account.name }}</option>
                </select>
                <button type="button" class="btn btn-primary" @click="funiter.doTx(tx)">ök!</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import { reactive, computed } from 'vue'

const tx = reactive({
    from: 'fÜne', 
    to: '', 
    value: 1
})


const fromAccounts = computed(() => {
    return funiter.accounts
})

const toAccounts = computed(() => {
    return funiter.accounts
})


</script>