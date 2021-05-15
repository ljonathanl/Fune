<template>
    <div>
        <h4 class="text-center mb-3">
            <en>account</en>
            <fr>compte</fr>
            <info-button class="position-absolute" info="info-account" /> 
        </h4>
        <info infoId="info-account">
            <en>EN_info-account</en>
            <fr>FR_info-account</fr>
        </info>

        <div class="mt-3 mb-3">
            <h3 class="text-center mb-6">
                <select v-model="state.account" class="text-center form-control mx-auto" style="max-width: 300px; font-size: 1.3em; text-align-last: center;">
                    <option disabled :value="null">
                        <en>whö</en>
                        <fr>qüi</fr>
                    </option>
                    <option v-for="selectedAccount in state.accounts" :value="selectedAccount" :key="selectedAccount.name">
                        <strong>{{ selectedAccount.name }}</strong>
                    </option>
                </select>
            </h3>
            <div v-if="state.account">
                <div class="display-3 text-center">
                    <span>{{ withoutDigit(state.account.balance) }}</span>
                    <small class="align-baseline" style="font-size: 50%;">.{{ digit(state.account.balance) }}</small> 
                    <small> Ü</small>
                </div>
                <p class="display-5 text-center" v-if="state.account.role == 'bank'">
                    <en>bank</en>
                    <fr>banque</fr>
                </p>
                <p class="display-5 text-center" v-else-if="state.account.role == 'wallet'">
                    <en>wallet</en>
                    <fr>compte simple</fr>
                </p>
                <p class="display-5 text-center" v-else>
                    <en>Üman</en>
                    <fr>Ümain</fr>
                </p>

                <h4 class="text-center mt-4">
                    <en>transaction</en>
                    <fr>transaction</fr>
                </h4>
                <form class="mb-4 justify-content-center mx-auto" style="max-width: 500px;" >
                    <div>
                        <div class="input-group mb-1">
                            <input v-model="state.tx.value" type="number" :max="Math.round(state.account.balance/100)" step="any" min="0" class="form-control text-right">
                            <small class="input-group-text">Ü</small>
                            <label class="input-group-text" for="accountTxTo">
                                <en> tö </en>
                                <fr> à </fr> 
                            </label>
                            <select v-model="state.tx.to" id="accountTxTo" class="form-control p-1">
                                <option disabled value="">
                                    <en>someöne</en>
                                    <fr>qüi</fr>
                                </option>
                                <option v-for="otherAccount in state.otherAccounts" :value="otherAccount.name" :key="otherAccount.name">
                                    <strong>{{ otherAccount.name }}</strong>
                                </option>
                            </select>
                            <button type="button" class="btn btn-primary" @click="doTx()">ök!</button>
                        </div>
                        <div class="input-group">
                            <label class="input-group-text" for="txMessage">
                                <en>message</en>
                                <fr>message</fr> 
                            </label>
                            <input v-model="state.tx.message" type="text" maxlength="32" class="form-control" id="txMessage">
                        </div>
                    </div>
                </form>

                <h4 class="text-center mt-4">
                    <en>stats</en>
                    <fr>stats</fr>
                </h4>
                <trend
                    class="p-2"
                    :data="state.stats"
                    style="background-color: #00000088; border-radius: .5rem"
                    :gradientDirection="'top'"
                    :gradient="['#f560a2', '#e83283', '#bd125e']"
                    :padding="10"
                    :radius="8"
                    :stroke-width="1.5"
                    :stroke-linecap="'butt'"
                    :min="0"
                    :max="1000"
                    auto-draw
                    smooth>
                </trend>

                <h4 class="text-center mt-4">
                    <en>diary</en>
                    <fr>journal</fr>
                </h4>
                <ul class="list-group list-group-flush pointer mx-auto" style="max-width: 450px;">
                    <li v-for="transaction in state.transactions" :key="transaction.id" class="list-group-item list-group-item-action p-2">
                        <div class="d-flex w-100 justify-content-between" @click="state.tx.to = transaction.from == state.account.name ? transaction.to : transaction.from">
                            <div>
                                <h5 v-if="transaction.from == state.account.name">
                                    <span style="width: 85px;" class="badge bg-light text-dark text-right">{{ funiter.currencyDecimal(transaction.value) }} Ü</span>
                                    <span style="width: 70px;" class="d-inline-block text-center">
                                        <en> to </en>
                                        <fr> à </fr> 
                                    </span>
                                    <strong>
                                        <span>
                                            {{ transaction.to }}
                                        </span>
                                    </strong>
                                </h5>
                                <h5 v-else>
                                    <span style="width: 85px;" class="badge bg-primary text-right">{{ funiter.currencyDecimal(transaction.value) }} Ü</span>
                                    <span style="width: 70px;" class="d-inline-block text-center">
                                        <en> from </en>
                                        <fr> de </fr>
                                    </span>
                                    <strong>
                                        <span>
                                            {{ transaction.from }}
                                        </span>
                                    </strong>
                                </h5>
                            </div>
                            <small class="text-right"> {{ formatDay(transaction.day) }}</small>
                        </div>
                        <span class="fw-bold">{{ translateTxMessage(transaction.message) }}</span>
                    </li>
                </ul>
            </div>
        </div> 
    </div>    
</template>

<script setup>
import { Trend } from './Trend.js'
import { fr, en, translate } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import info from './Info.vue'
import infoButton from './Info-Button.vue'
import { reactive, watch, computed, onMounted } from 'vue'

const state = reactive({
    account: null,
    accounts: computed(() => {
        return funiter.accounts.filter(a => a.role != 'bank')
    }),
    otherAccounts: computed(() => {
        if (!state.account)
            return null
        return funiter.accounts.filter(a => a.role != 'bank' && a.name != state.account.name)
    }),
    stats: [],
    transactions: [],
    tx: {from: '', to: '', message: '', value: 1},
})

const refresh = () => {
    if (state.account) {
        state.transactions = funiter.getAccountTx(state.account.name, 10).reverse()
        state.stats = funiter.getAccountStats(state.account.name, 'day')
    }
}

watch(() => state.account,  () => {
    refresh()
})

watch(() => funiter.currency, refresh, { deep: true })

const doTx = () => {
    state.tx.from = state.account.name
    console.log(state.tx)
    const tx = funiter.doTx(state.tx)
    if (tx) {
        state.tx.message = ''
    }
    refresh()
}

const withoutDigit = (value) => {
    return funiter.currencyDecimal(value).slice(0, -3)
}

const digit = (value) => {
    return funiter.currencyDecimal(value).slice(-2)
}

const translateTxMessage = (message) => {
    if (!message)
        return ''

    if (message == '!1Ucreation') {
        return translate({
            en: '> u crëate Ü!',
            fr:  '> crëation de Ü !'
        })
    }
    
    if (message.indexOf('!revaluation%') == 0) {
        let c = message.split('%')[1]
        return translate({
            en: '> all the Ü melt by ' + c + '%!',
            fr:  '> tous les Ü fondent de ' + c + '% !'
        })
    }

    return message ? '> ' + message : ''
}

const formatDay = (day) => {
    if (day >= funiter.currency.elapsedTime) {
        return translate({
            en: 'today',
            fr:  'aujourd\'hui'
        })
    } else if (day == funiter.currency.elapsedTime - 1) {
        return translate({
            en: 'yesterday',
            fr:  'hier'
        })
    }
    return translate({
        en: (funiter.currency.elapsedTime - day) + ' days ago',
        fr:  'il y a ' + (funiter.currency.elapsedTime - day) + ' jours'
    })
}

onMounted(() => {
    if (!state.account) {
        const accounts = state.accounts
        if (accounts.length > 1) {
            state.account = state.accounts[0]
        }
    }
})

</script>