<template>
    <div>
        <h4 class="text-center">
            <en>accounts</en>
            <fr>comptes</fr> 
        </h4>
        <table class="table table-hover">
            <thead>
                <tr>
                    <th @click="state.onlySelected = !state.onlySelected" :class="{'bg-primary': state.onlySelected}" class="pointer">
                        <en>stats</en>
                        <fr>stats</fr> 
                    </th>
                    <th @click="sortBy('name')" class="pointer">
                        <en>name</en>
                        <fr>nom</fr> 
                    </th>
                    <th @click="sortBy('role')" class="text-center pointer">
                        <en>role</en>
                        <fr>rôle</fr>
                    </th>
                    <th @click="sortBy('balance')" class="text-right pointer">
                        <en>balance</en>
                        <fr>solde</fr>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td>
                        <input :placeholder="translate({en: 'näme', fr: 'nöm'})" v-model="state.newAccount.name" type="text" class="form-control" id="accountName" maxlength="10"/>
                    </td>
                    <td class="text-center">
                        <select v-model="state.newAccount.role" class="form-control">
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
                    </td>
                    <td></td>
                    <td class="text-right">
                        <button 
                            type="button" 
                            :disabled="3 > state.newAccount.name.length || funiter.accounts.some(_ => _.name == state.newAccount.name)" 
                            class="btn btn-primary" 
                            @click="createAccount()">
                            <en>nëw!</en>
                            <fr>noüveau!</fr>
                        </button>
                    </td>
                </tr>
                <tr v-for="account in sortedAccounts" :key="account.name">
                    <td :style="{'background-color': getColor(account)}" @click="funiter.select(account)" class="pointer"></td>
                    <td @click="funiter.select(account)" class="pointer">
                        {{ account.name }}
                    </td>
                    <td class="text-left">
                        <span v-if="account.role == 'human'" class="badge bg-primary mr-3" style="width: 50px;">
                            <en><small>Ü</small>man</en>
                            <fr><small>Ü</small>main</fr>
                        </span>
                        <span v-else-if="account.role == 'wallet'" class="badge bg-secondary mr-3" style="width: 50px;">
                            <en>wället</en>
                            <fr>sïmple</fr>
                        </span>
                        <span v-else class="badge bg-danger mr-3" style="width: 50px;">
                            <en>bänk</en>
                            <fr>bänque</fr>
                        </span>
                        <a v-if="account.role != 'bank'" href="#" @click.stop.prevent="switchAccountRole(account)">
                            <en>change</en>
                            <fr>modifier</fr>
                        </a>
                    </td>
                    <td class="text-right">
                        <template v-if="account.role != 'bank'">
                            <strong>{{ funiter.currencyDecimal(account.balance) }}<small class="mr-3"> Ü </small></strong>
                            <a href="#" @click.stop.prevent="resetBalance(account)">
                                <en>reset</en>
                                <fr>raz</fr>
                            </a>
                        </template>
                    </td>
                    <td class="text-right">
                        <a v-if="account.name != funiter.name" href="#" @click.stop.prevent="deleteAccount(account)">x</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { fr, en, translate } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import { defineProps, reactive, ref, computed, onMounted, defineEmit } from 'vue'



const { colors } = defineProps({
    colors: Array,
})

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
    let index = funiter.selectedAccounts.indexOf(account.name)
    if (index < 0)
        return null
    return colors[index % colors.length] 
}
</script>