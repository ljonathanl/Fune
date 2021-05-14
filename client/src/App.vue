<template>
  <div>
    <div class="container mt-3">
      <h1 class="display-1 text-center mb-3">
          <span class="bg-primary px-1 align-middle" style="font-family: monospace;">fї</span>
          <!-- <img src="/favicon64x64.png"/> -->
          <span class="align-middle"> f<small>Ü</small>ne</span>
      </h1>
      <div class="text-center mb-3">
        <button class="btn btn-sm btn-outline-secondary text-light" :disabled="language == 'fr'" @click="setLanguage('fr')">FR</button>
        <button class="btn btn-sm btn-outline-secondary text-light" :disabled="language == 'en'" @click="setLanguage('en')">EN</button>
      </div>
      <p class="lead text-center mb-3">
          <en>
            <strong>f<small>Ü</small>ne</strong> is a web app to test and play with a simple <a href="https://libre-currency.org">Libre Currency</a> called <strong>f<small>Ü</small>ne</strong> (pronounced /fən/ like fun)
          </en>
          <fr>
            <strong>f<small>Ü</small>ne</strong> est une appli web qui permet de jouer avec une simple <a href="https://monnaie-libre.fr/">Monnaie Libre</a> appelée <strong>f<small>Ü</small>ne</strong> (prononcée /fən/ comme fun en anglais)
          </fr>
      </p>

      <p class="lead text-center mb-5">
          <en>
              a <small>Ü</small>man account create some new <small>Ü</small> (the <small>Ü</small>nit of the f<small>Ü</small>ne currency) each day<br>
              <small>old created <strong><small>Ü</small>nits</strong> melt by a given percentage each <strong>revaluation period</strong></small><br>
          </en>
          <fr>
              un compte <small>Ü</small>main crée de nouvelles <small>Ü</small> (l'<small>Ü</small>nité de la monnaie f<small>Ü</small>ne) chaque jour<br>
              <small>les anciennes <strong><small>Ü</small>nités</strong> fondent d'un certain pourcentage à chaque <strong>période de réévaluation</strong></small><br>
          </fr>
      </p>
    </div>

    <funiter :accounts="accounts" :selectedAccounts="accounts">
      <funiter-data class="mx-auto" style="max-width: 400px;" />
      <funiter-control class="mx-auto sticky-top" />
      <div class="d-flex align-items-start flex-wrap p-2" style="justify-content: space-evenly;">
          <div class="mx-auto">
            <funiter-currency class="mb-3 mx-auto" style="max-width: 450px;"/>
            <funiter-transaction class="mb-3 mx-auto" style="max-width: 450px;" />
          </div>
          <div class="mx-auto">
            <funiter-stats class="mb-3 mx-auto" style="min-width: 33vw; max-width: 600px;" />
            <funiter-accounts class="mb-3 mx-auto" style="max-width: 450px;" />
          </div>  
        <funiter-account class="mb-3 mx-auto" />
      </div>
    </funiter>
  </div>
</template>

<script>
import { watch } from 'vue'
import funiterLib from './lib/funiterReactive.js'
import funiter from './components/Funiter.vue'
import { fr, en, language, setLanguage } from './components/Translate.js'
import funiterData from './components/Funiter-Data.vue'
import funiterControl from './components/Funiter-Control.vue'
import funiterCurrency from './components/Funiter-Currency.vue'
import funiterTransaction from './components/Funiter-Transaction.vue'
import funiterAccount from './components/Funiter-Account.vue'
import funiterAccounts from './components/Funiter-Accounts.vue'
import funiterStats from './components/Funiter-Stats.vue'

const currencyToHash = (currency) => {
  const params = new URLSearchParams()
  params.append('e', currency.expression)
  params.append('m', currency.mode)
  params.append('upd', currency.uPerDay)
  params.append('rt', currency.revaluationTime)
  params.append('st', currency.stepTime)
  return params.toString()   
}

const hashToCurrency= (hash) => {
  const params = new URLSearchParams(hash)
  const currency = {
    mode: params.get('m') == 'grew' ? 'grew' : 'melt',
    expression: params.get('e'),
    uPerDay: parseInt(params.get('upd')),
    revaluationTime: parseInt(params.get('rt')),
    stepTime: parseInt(params.get('st')),
  }
  return currency
}


let state = JSON.parse(localStorage.getItem('state'))
if(window.location.hash) {
  if (!state) 
    state = {currency: {}}
  Object.assign(state.currency, hashToCurrency(window.location.hash.substring(1)))
}

funiterLib.restoreState(state)

</script>

<script setup>

const saveState = () => {
  localStorage.setItem('state', JSON.stringify(funiterLib.getState()))
}

watch(() => funiterLib.currency,
  () => {
    window.location.hash = "#" + currencyToHash(funiterLib.currency)
    saveState()
  }
)

watch(() => funiterLib.selectedAccounts, saveState, { deep: true })

const accounts = []

if (funiterLib.accounts.length <= 1) {
  accounts.push({name: 'Alice', balance: 10000, role: 'human'})
  accounts.push({name: 'Bob', balance: 20000, role: 'human'})
  accounts.push({name: 'Carole', balance: 0, role: 'human'})
}

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>





