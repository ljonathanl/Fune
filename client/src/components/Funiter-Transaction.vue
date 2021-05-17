<template>
    <div>
        <h4 class="text-center mb-3">
            <en>transaction</en>
            <fr>transaction</fr>
            <info-button class="position-absolute" info="info-transaction" />
        </h4>
        <info infoId="info-transaction">
            <en>EN_info-transaction</en>
            <fr>FR_info-transaction</fr>
        </info>
        <form class="text-center">
            <div class="input-group mb-1">
                <label class="input-group-text" for="txFrom">
                    <en> fröm </en>
                    <fr> de </fr> 
                </label>
                <select v-model="tx.from" id="txFrom" class="form-control select-text-center">
                    <option v-for="account in fromAccounts" :value="account.name" :key="account.name">{{ account.name }}</option>
                </select>
                <label class="input-group-text" for="txTo">
                    <en> tö </en>
                    <fr> à </fr> 
                </label>
                <select v-model="tx.to" id="txTo" class="form-control select-text-center">
                    <en><option disabled value="">select öne</option></en>
                    <fr><option disabled value="">qüi</option></fr>
                    <option v-for="account in toAccounts" :value="account.name" :key="account.name">{{ account.name }}</option>
                </select>
            </div>
            <div class="input-group mb-1">
                <input v-model="tx.value" type="number" step="any" class="form-control text-right">
                <span class="input-group-text">Ü</span>
                <button type="button" class="btn btn-primary" @click="funiter.doTx(tx)">ök!</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import info from './Info.vue'
import infoButton from './Info-Button.vue'
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