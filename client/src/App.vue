<template>
  <div>
    <div class="container mt-3 mb-5">
      <h1 class="display-1 text-center mb-3">
          <!-- <code class="bg-primary px-1 align-middle text-light">fї</code> -->
          <img src="/favicon90x90.png" class="icon"/>
          <span class="align-middle"> f<small>Ü</small>ne</span>
      </h1>
      <div class="justify-content-center mb-3 input-group mx-auto fit-content">
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
            a <strong>Üman</strong> account create some new Ü (the Ünit of the f<small>Ü</small>ne money) every
        </en>
        <fr>
            un compte <strong>Ümain</strong> crée de nouvelles <small>Ü</small> (l'Ünité de la monnaie f<small>Ü</small>ne) chaque
        </fr>
        <select class="form-control select-text-center d-inline fit-content" v-model="funiterLib.creationPeriod">
          <option value="day">{{ translateTime('day') }}</option>
          <option value="month">{{ translateTime('month') }}</option>
          <option value="year">{{ translateTime('year') }}</option>
        </select>
      </p>

      <p class="lead text-center">
        <en>
            the old created Ünits melt according to a <strong>mathematical</strong>s formula at each <strong>revaluation period</strong>
        </en>
        <fr>
            les anciennes Ünités fondent suivant une <strong>formule</strong> mathématique à chaque <strong>période de réévaluation</strong>
        </fr>
      </p>
      
      <info infoId="info-home-funiter" class="mx-auto w-auto mt-3">
        <en>EN_info-home-funiter</en>
        <fr>FR_info-home-funiter</fr>
      </info>
    </div>

    <funiter :accounts="accounts" :selectedAccounts="accounts" class="mt-3">
      <funiter-data class="mx-auto" style="max-width: 400px;" />
      <funiter-control class="mx-auto sticky-top" />
      <div class="d-flex align-items-start flex-wrap p-2 mt-3" style="justify-content: space-evenly;">
        <div style="min-width: 30vw;">
          <funiter-currency class="mb-3 mx-auto" style="width: 380px;"/>
        </div>
        <div class="mx-auto" style="min-width: 35vw; max-width: 600px;">
          <funiter-stats class="mb-3" />
          <funiter-transaction class="mb-3 mx-auto" style="max-width: 450px;" />
        </div>
        <div style="min-width: 30vw;">
          <funiter-accounts class="mb-3 mx-auto" style="max-width: 450px;" />
        </div>
        <funiter-account class="mb-3 mx-auto" style="min-width: 35vw; max-width: 600px;" />
      </div>
    </funiter>
  </div>
</template>

<script>
import { watch, ref, onMounted } from 'vue'
import funiterLib from './lib/funiterReactive.js'
import funiter from './components/Funiter.vue'
import { fr, en, language, setLanguage, translateTime } from './components/Translate.js'
import funiterData from './components/Funiter-Data.vue'
import funiterControl from './components/Funiter-Control.vue'
import funiterCurrency from './components/Funiter-Currency.vue'
import funiterTransaction from './components/Funiter-Transaction.vue'
import funiterAccount from './components/Funiter-Account.vue'
import funiterAccounts from './components/Funiter-Accounts.vue'
import funiterStats from './components/Funiter-Stats.vue'

import info from './components/Info.vue'
import infoButton from './components/Info-Button.vue'

let state = JSON.parse(localStorage.getItem('state'))
funiterLib.restoreState(state)

</script>

<script setup>

const test = ref('info')

const saveState = () => {
  localStorage.setItem('state', JSON.stringify(funiterLib.getState()))
}

watch(() => funiterLib.currency, saveState, { deep: true })

watch(() => funiterLib.selectedAccounts, saveState, { deep: true })

const accounts = []

if (funiterLib.accounts.length <= 1) {
  const alice = {name: 'Alice', balance: 10000, role: 'human'}
  const bob = {name: 'Bob', balance: 20000, role: 'human'}
  const carole = {name: 'Carole', balance: 0, role: 'human'}
  funiterLib.addAccounts([alice, bob, carole])
  funiterLib.select(alice)
  funiterLib.select(bob)
  funiterLib.select(carole)
}

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style>
body {
background-image: url("/padded.png"), linear-gradient(180deg, #4a5e86 20%, #1f283a);
/* background-image: url("./rebel.png"); */
background-color: #4a5e86;
}

.select-text-center {
  text-align-last: center;
}

.pointer {
  cursor: pointer;
}

input[type=number] {
  -moz-appearance: textfield;
}

.stats {
  background: #2d323e;
  box-shadow: inset 6px 6px 7px #00000044,
    inset -6px -6px 7px #FFFFFF11,
    3px 3px 5px #00000066,
    -3px -3px 5px #FFFFFF22;
  border-radius: 1rem;
}

.icon {
  box-shadow: inset 6px 6px 7px #00000044,
    inset -6px -6px 7px #FFFFFF11,
    3px 3px 5px #00000066,
    -3px -3px 5px #FFFFFF22;
  border-radius: 1rem;
}

.emboss {
  box-shadow: 3px 3px 5px #00000066,
    -3px -3px 5px #FFFFFF22;
}

.control {
  box-shadow: 0px -1px 5px #FFFFFF33, 0px 3px 10px #FFFFFF33;
}

.input-group, .list-group {
  box-shadow: 0px 5px 20px #00000033;
}

.form-control {
  box-shadow: inset 0px 3px 2px 0px #00000033;
}

.fit-content {
  width: max-content!important;
}

.role {
  height: 2em;
}

</style>



