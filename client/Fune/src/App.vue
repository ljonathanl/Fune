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

    <funiter :currency="currency" :accounts="accounts" :selectedAccounts="accounts">
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

<script setup>
import { ref } from 'vue'
import funiter from './components/Funiter.vue'
import { fr, en } from './components/Translate.js'
import funiterControl from './components/Funiter-Control.vue'
import funiterCurrency from './components/Funiter-Currency.vue'
import funiterTransaction from './components/Funiter-Transaction.vue'
import funiterAccounts from './components/Funiter-Accounts.vue'
import funiterStats from './components/Funiter-Stats.vue'


const colors = [ 
  '#FFFFFFDD', '#FE4365DD', '#F9CDADDD', 
  '#83AF9BDD', '#A7226EDD', '#F26B38DD', 
  '#F7DB4FDD', '#CAFDE0DD', '#FFB8EADD',
  '#C3421ADD', '#4F6ABFDD'
]

const currency = {
  expression: '(M/N)*0.01',
  mode: 'grew',
  uPerDay: 365,
  stepTime: 1,
}

const accounts = [
  {name: 'Alice', balance: 3837 * 1000, role: 'human'},
  {name: 'Bob', balance: 3837 * 1000 * 2, role: 'human'},
  {name: 'Carole', balance: 0, role: 'human'},
]

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>



