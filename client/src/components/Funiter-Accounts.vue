<template>
    <div>
        <h4 class="text-center mb-3">
            <en>accounts</en>
            <fr>comptes</fr>
            <info-button class="position-absolute" info="info-accounts" />  
        </h4>
        <info infoId="info-accounts">
            <en>EN_info-accounts</en>
            <fr>FR_info-accounts</fr>
        </info>

        <table class="table table-hover">
            <thead>
                <tr>
                    <th @click="state.onlySelected = !state.onlySelected" :class="{'bg-primary': state.onlySelected}" class="pointer" style="width: 25px;">
                        <en>stats</en>
                        <fr>stats</fr> 
                    </th>
                    <th @click="sortBy('name')" class="pointer">
                        <en>näme</en>
                        <fr>nöm</fr> 
                    </th>
                    <th @click="sortBy('role')" class="text-center pointer">
                        <en>röle</en>
                        <fr>röle</fr>
                    </th>
                    <th @click="sortBy('balance')" class="text-right pointer">
                        <en>balance</en>
                        <fr>solde</fr>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="account in sortedAccounts" :key="account.name">
                    <td @click="funiter.select(account)" class="pointer">
                        <div :style="{'background-color': getColor(account) }" style="width:25px;height:25px" class="icon">
                        </div>
                    </td>
                    <td @click="funiter.select(account)" class="pointer">
                        {{ account.name }}
                    </td>
                    <td class="text-center">
                        <button v-if="account.role == 'human'" class="btn btn-sm btn-primary fw-bold emboss role" @click="switchAccountRole(account)">
                            <en>Üman</en>
                            <fr>Ümain</fr>
                        </button>
                        <button v-else-if="account.role == 'wallet'" class="btn btn-sm btn-secondary fw-bold emboss role" @click="switchAccountRole(account)">
                            <en>wället</en>
                            <fr>sïmple</fr>
                        </button>
                        <button v-else class="btn btn-sm btn-danger fw-bold emboss role" disabled>
                            <en>bänk</en>
                            <fr>bänque</fr>
                        </button>
                    </td>
                    <td class="text-right">
                        <template v-if="account.role != 'bank'">
                            <strong>{{ funiter.currencyDecimal(account.balance) }}<small> Ü </small></strong>
                        </template>
                    </td>
                    <td class="text-right">
                        <template v-if="account.role != 'bank'">
                            <a href="#" @click.stop.prevent="resetBalance(account)" class="mr-2">
                                <en>reset</en>
                                <fr>raz</fr>
                            </a>
                        </template>
                        <a v-if="account.name != funiter.name" href="#" @click.stop.prevent="deleteAccount(account)" class="text-warning"><i class="fa fa-trash"></i></a>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="input-group">
            <input :placeholder="translate({en: 'näme', fr: 'nöm'})" v-model="state.newAccount.name" type="text" class="form-control" id="accountName" maxlength="16"/>
            <select v-model="state.newAccount.role" class="form-control" style="max-width: 100px;">
                <option value="human">
                    <en>Üman</en>
                    <fr>Ümain</fr>
                </option>
                <option value="wallet">
                    <en>wället</en>
                    <fr>sïmple</fr>
                </option>
                <!-- <option value="bank">
                    <en>bänk</en>
                    <fr>bänque</fr>
                </option> -->
            </select>
            <button 
                type="button" 
                :disabled="3 > state.newAccount.name.length || funiter.accounts.some(_ => _.name == state.newAccount.name)" 
                class="btn btn-primary" 
                @click="createAccount()">
                <en>nëw!</en>
                <fr>noüveau!</fr>
            </button>
        </div>
    </div>
</template>

<script setup>
import { fr, en, translate } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import info from './Info.vue'
import infoButton from './Info-Button.vue'
import { defineProps, reactive, ref, computed, onMounted, defineEmit } from 'vue'



const state = reactive({
    onlySelected: false,
    sortKey: 'name',
    sortOrder: 1,
    newAccount: {name: '', role: 'human'}
})


const sortedAccounts = computed(() => {
    let filteredAccount = funiter.accounts.filter(a => a.role != "bank")
    if (state.onlySelected) {
        filteredAccount = filteredAccount.filter(a => funiter.isSelected(a))
    }
    let result = filteredAccount.sort((a, b) => {
        let va = a[state.sortKey]
        let vb = b[state.sortKey]
        return (va === vb ? 0 : va > vb ? 1 : -1) * state.sortOrder
    })
    return result
})

const sortBy = (key) => {
    if (key == state.sortKey) {
        state.sortOrder = - state.sortOrder;
    }
    state.sortKey = key
}

const createAccount = () => {
    state.newAccount.name = state.newAccount.name.trim()
    funiter.createAccount(state.newAccount)
}


const deleteAccount = (account) => {
    const name = account.name
    if (confirm(translate({ fr: "êtes vous sûr de supprimer " + name + " ?", en: "Are you sure to delete " + name + "?" }))) {
        funiter.deleteAccount(account)
    }
}

const switchAccountRole = (account) => {
    let role = account.role == 'human' ? 'wallet' : 'human'
    funiter.updateAccount(account, {role: role})
}

const resetBalance = (account) => {
    funiter.updateAccount(account, {balance: 0})
}


const getColor = (account) => {
    const selectedAccount = funiter.selectedAccounts.get(account.name)
    if (selectedAccount == null)
        return '#444444'
    return selectedAccount.color
}
</script>