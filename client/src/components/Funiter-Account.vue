<template>
    <div style="width: 400px;">
        <h4 class="text-center">
            <en>account</en>
            <fr>compte</fr> 
        </h4>

        <div class="mt-3 mb-3">
            <h2 class="text-center mb-6">
                <div class="dropdown">
                    <button class="btn btn-secondary btn-lg dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        {{ state.account ? state.account.name : translate({en: 'account', fr: 'compte'}) }}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                        <li v-for="selectedAccount in state.accounts" :value="selectedAccount.name" :key="selectedAccount.name">
                            <button class="dropdown-item" type="button" @click="state.account = selectedAccount">{{ selectedAccount.name }}</button>
                        </li>
                    </ul>
                </div>
            </h2>
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
                <form class="mb-4 justify-content-center" v-if="state.account.role == 'bank' || state.account.balance > 0">
                    <div>
                        <div class="input-group" style="width: 400px;">
                            <label class="input-group-text" for="txMessage" style="width: 90px;">
                                <en> value </en>
                                <fr> valeur </fr>
                            </label>
                            <input v-model="state.tx.value" type="number" :max="Math.round(state.account.balance/100)" step="any" min="0" class="form-control text-right">
                            <small class="input-group-text">Ü</small>
                            <label class="input-group-text" for="txTo">
                                <en> tö </en>
                                <fr> à </fr> 
                            </label>
                            <select v-model="state.tx.to" id="txTo" class="form-select">
                                <option disabled value="">
                                    <en>someöne</en>
                                    <fr>qüi</fr>
                                </option>
                                <option v-for="otherAccount in state.otherAccounts" :value="otherAccount.name" :key="otherAccount.name">
                                    <strong>{{ otherAccount.name }}</strong>
                                </option>
                            </select>
                            <button type="button" class="btn btn-primary ml-3" @click="doTx()">ök!</button>
                        </div>
                        <div class="input-group">
                            <label class="input-group-text" for="txMessage" style="width: 90px;">
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
                    :data="state.stats"
                    :gradientDirection="'top'"
                    :gradient="['#df691a', '#a54f15', '#65300d']"
                    :padding="10"
                    :radius="8"
                    :stroke-width="1"
                    :stroke-linecap="'butt'"
                    :min="0"
                    :max="1000"
                    :height="200"
                    :width="400"
                    auto-draw
                    smooth>
                </trend>

                <h4 class="text-center mt-4">
                    <en>diary</en>
                    <fr>journal</fr>
                </h4>
                <ul class="list-group list-group-flush" style="max-width: 440px;">
                    <li v-for="transaction in state.transactions" :key="transaction.id" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <div>
                                <h5 v-if="transaction.from == state.account.name">
                                    <span style="width: 80px;" class="badge bg-light text-dark text-right">{{ funiter.currencyDecimal(transaction.value) }}<small> Ü</small></span>
                                    <span style="width: 50px;" class="d-inline-block text-center">
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
                                    <span style="width: 80px;" class="badge bg-primary text-right">{{ funiter.currencyDecimal(transaction.value) }}<small> Ü</small></span>
                                    <span style="width: 50px;" class="d-inline-block text-center">
                                        <en> from </en>
                                        <fr> de </fr>
                                    </span>
                                    <strong>
                                        <span>
                                            {{ transaction.from }}
                                        </span>
                                    </strong>
                                </h5>
                                {{ translateTxMessage(transaction.message) }}
                            </div>
                            <small> {{ formatDay(transaction.day) }}</small>
                        </div>
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
import { reactive, watch, computed } from 'vue'

const state = reactive({
    account: null,
    accounts: computed(() => {
        return funiter.accounts.filter(a => a.role != 'bank')
    }),
    otherAccounts: computed(() => {
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
    funiter.doTx(state.tx)
    refresh()
}

const withoutDigit = (value) => {
    return funiter.currencyDecimal(value).slice(0, -3)
}

const digit = (value) => {
    return funiter.currencyDecimal(value).slice(-2)
}

const translateTxMessage = (message) => {
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

</script>