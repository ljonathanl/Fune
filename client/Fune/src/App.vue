<template>
  <div>
    <h1 class="display-1 text-center mb-5">
        <!-- <span class="bg-primary pl-1 pr-1 align-middle" style="font-family: monospace;">fї</span> -->
        <img src="/favicon64x64.png"/>
        <span class="align-middle"> f<small>Ü</small>ne</span>
    </h1>

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

    <funiter :accounts="accounts" :selectedAccounts="accounts">
      <funiter-control class="m-auto" />
      <div class="d-flex align-items-start flex-wrap mb-3" style="justify-content: space-evenly;">
        <div style="min-width: 500px;">
          <funiter-currency class="m-auto" style="width: 400px;" />
          <funiter-transaction class="mt-5" />
        </div>
        <div style="min-width: 700px;">
          <funiter-stats :colors="colors" class="w-auto" />
          <funiter-accounts :colors="colors" class="mt-3" />
        </div>
      </div>
    </funiter>
  </div>
</template>

<script>
import { watch } from 'vue'
import funiterLib from './lib/funiterReactive.js'
import funiter from './components/Funiter.vue'
import { fr, en } from './components/Translate.js'
import funiterControl from './components/Funiter-Control.vue'
import funiterCurrency from './components/Funiter-Currency.vue'
import funiterTransaction from './components/Funiter-Transaction.vue'
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

watch(() => funiterLib.currency,
  () => {
    window.location.hash = "#" + currencyToHash(funiterLib.currency)
    localStorage.setItem('state', JSON.stringify(funiterLib.getState()))
  }
)

const colors = [ 
  '#FFFFFFDD', '#FE4365DD', '#F9CDADDD', 
  '#83AF9BDD', '#A7226EDD', '#F26B38DD', 
  '#F7DB4FDD', '#CAFDE0DD', '#FFB8EADD',
  '#C3421ADD', '#4F6ABFDD'
]

const accounts = []

if (funiterLib.accounts.length <= 1) {
  accounts.push({name: 'Alice', balance: 10000, role: 'human'})
  accounts.push({name: 'Bob', balance: 20000, role: 'human'})
  accounts.push({name: 'Carole', balance: 0, role: 'human'})
}

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>





