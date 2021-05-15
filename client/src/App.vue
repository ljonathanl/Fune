<template>
  <div>
    <div class="container mt-3 mb-3">
      <h1 class="display-1 text-center mb-3">
          <code class="bg-primary px-1 align-middle text-light">fї</code>
          <!-- <img src="/favicon64x64.png"/> -->
          <span class="align-middle"> f<small>Ü</small>ne</span>
      </h1>
      <div class="justify-content-center mb-3 input-group mx-auto w-auto">
        <button class="btn btn-sm text-light" :class="{ 'btn-outline-secondary': language != 'fr', 'btn-primary': language == 'fr'}" @click="setLanguage('fr')">FR</button>
        <button class="btn btn-sm text-light" :class="{ 'btn-outline-secondary': language != 'en', 'btn-primary': language == 'en'}"  @click="setLanguage('en')">EN</button>
      </div>
      <p class="lead text-center mb-3">
        <en>
          <strong>f<small>Ü</small>ne</strong> is a web app to test and play with a simple <a href="https://libre-currency.org">Libre Currency</a> called <strong>f<small>Ü</small>ne</strong> (pronounced /fən/ like fun)
        </en>
        <fr>
          <strong>f<small>Ü</small>ne</strong> est une appli web qui permet de jouer avec une simple <a href="https://monnaie-libre.fr/">Monnaie Libre</a> appelée <strong>f<small>Ü</small>ne</strong> (prononcée /fən/ comme fun en anglais)
        </fr>
        <info-button class="px-0" info="info-home-libreCurrency" />
      </p>
      <info infoId="info-home-libreCurrency">
        <en>EN_info-home-libreCurrency</en>
        <fr>FR_info-home-libreCurrency</fr>
      </info>

      <p class="lead text-center">
        <en>
            a <small>Ü</small>man account create some new Ü (the Ünit of the f<small>Ü</small>ne currency) each day<br>
            <small>old created <strong>Ünits</strong> melt by a given percentage each <strong>revaluation period</strong></small>
        </en>
        <fr>
            un compte Ümain crée de nouvelles <small>Ü</small> (l'Ünité de la monnaie f<small>Ü</small>ne) chaque jour<br>
            <small>les anciennes <strong>Ünités</strong> fondent d'un certain pourcentage à chaque <strong>période de réévaluation</strong></small>
        </fr>
      </p>
      
      <info infoId="info-home-funiter" class="mx-auto w-auto mt-3">
        <en>EN_info-home-funiter</en>
        <fr>FR_info-home-funiter</fr>
      </info>
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
import { watch, ref } from 'vue'
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

import info from './components/Info.vue'
import infoButton from './components/Info-Button.vue'

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

const test = ref('info')

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





