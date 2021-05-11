<template>
    <div>
        <h4 class="text-center">
            <en>currency</en>
            <fr>monnaie</fr>
        </h4>
        <form>
            <div class="input-group mb-3">
                <label class="input-group-text w-50">
                    <en>Ü revaluation</en>
                    <fr>réévaluation de Ü</fr>
                </label>
                <select v-model="editedCurrency.mode" id="currencyMode" class="form-select w-50"
                    :class="{'bg-primary': editedCurrency.mode != funiter.currency.mode}">
                    <option value="melt">
                        <en>melting</en>
                        <fr>fonte</fr>
                    </option>
                    <option value="grew">
                        <en>growth</en>
                        <fr>croissance</fr>
                    </option>
                </select>
            </div>   
            <div class="input-group mb-3">
                <span class="input-group-text" v-if="editedCurrency.mode == 'melt'">Ü(t-1) = ( 1 - </span>
                <span class="input-group-text" v-else>Ü(t+1) = ( 1 + </span>
                <input id="currencyExpression" v-model="editedCurrency.expression" type="text" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.expression != funiter.currency.expression}">
                <span class="input-group-text"> ) Ü(t)</span>    
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyUPerDay">
                    <en>Ü per day</en>
                    <fr>Ü par jour</fr>
                </label>
                <input id="currencyUPerDay" v-model="editedCurrency.uPerDay" type="number" min="0" max="1000" step="1" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.uPerDay != funiter.currency.uPerDay}">
                <span class="input-group-text">Ü</span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyRevaluationTime">
                    <en>revaluation period</en>
                    <fr>réévaluation</fr>
                </label>
                <input id="currencyRevaluationTime" v-model="editedCurrency.revaluationTime" type="number" min="1" max="400" step="1" class="form-control text-right" 
                    :class="{'bg-primary': editedCurrency.revaluationTime != funiter.currency.revaluationTime}">
                <span class="input-group-text">
                    <en>day<span v-if="editedCurrency.revaluationTime > 1">s</span></en>
                    <fr>jour<span v-if="editedCurrency.revaluationTime > 1">s</span></fr>
                </span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyStepTime">
                    <en>day duration</en>
                    <fr>durée d'un jour</fr>
                </label>
                <input id="currencyStepTime" v-model="editedCurrency.stepTime" type="number" min="1" max="90000" step="1" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.stepTime != funiter.currency.stepTime}">
                <span class="input-group-text">
                    <en>second<span v-if="editedCurrency.stepTime > 1">s</span></en>
                    <fr>seconde<span v-if="editedCurrency.stepTime > 1">s</span></fr>
                </span>
            </div>
            <div class="d-grid gap-2 d-md-flex mb-3" v-if="currencyChange">
                <button type="button" class="btn btn-secondary mr-auto" @click="Object.assign(editedCurrency, funiter.currency)">
                    <en>ündo!</en>
                    <fr>annüler!</fr>
                </button>
                <button type="button" class="btn btn-primary" @click="updateCurrency()">
                    <en>üpdate!</en>
                    <fr>valïder!</fr>
                </button>
            </div>
            <div class="input-group mb-3 mt-5">
                <label class="input-group-text" for="currencyMass">
                    <en>monetary mass (M)</en>
                    <fr>masse monétaire (M)</fr>
                </label>
                <input id="currencyMass" :value="funiter.currencyWithoutDecimal(funiter.currency.monetaryMass)" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">Ü</span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyNbMembers">
                    <en>Üman accounts (N)</en>
                    <fr>comptes Ümains (N)</fr>
                </label>
                <input id="currencyNbMembers" :value="funiter.currency.nbMembers" type="text" class="form-control text-right" disabled>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyAvg">
                    <en>average</en>
                    <fr>moyenne</fr>
                </label>
                <input id="currencyAvg" :value="funiter.currencyWithoutDecimal(funiter.currency.average)" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">
                    <en>Ü / Üman</en>
                    <fr>Ü / Ümain</fr>
                </span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyQuantitative">
                    <en>quantitative value</en>
                    <fr>valeur quantitative</fr>
                </label>
                <input id="currencyQuantitative" :value="funiter.currency.quantitative.toFixed(2)" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">
                    <en>Ü / Ü(0)</en>
                    <fr>Ü / Ü(0)</fr>
                </span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyLastGrew">
                    <en>last growth</en>
                    <fr>dernière croissance</fr>
                </label>
                <input id="currencyLastGrew" :value="lastGrew" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">%</span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyLastMelt">
                    <en>last melting</en>
                    <fr>dernière fonte</fr>
                </label>
                <input id="currencyLastMelt" :value="funiter.currency.lastMelt" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">%</span>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text" for="currencyElapsedTime">
                    <en>elapsed time (T)</en>
                    <fr>temps écoulé (T)</fr>
                </label>
                <input id="currencyElapsedTime" v-model="funiter.currency.elapsedTime" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">
                    <en>day<span v-if="funiter.currency.elapsedTime > 1">s</span></en>
                    <fr>jour<span v-if="funiter.currency.elapsedTime > 1">s</span></fr>
                </span>
            </div>
        </form>    
    </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { fr, en } from './Translate.js'
import { reactive, computed, onMounted } from 'vue'

const editedCurrency = reactive({
    expression: '',
    mode: 'melt',
    uPerDay: 1,
    stepTime: 0,
    revaluationTime: 0,
})

const lastGrew = computed(() => {
    if (funiter.currency.lastMelt == 0)
        return 0
    return ((1 / (1 / (funiter.currency.lastMelt / 100) - 1)) * 100).toFixed(2)
})

const currencyChange = computed(() => {
    if (!funiter || !funiter.currency)
        return false
    return funiter.currency.expression != editedCurrency.expression
        || funiter.currency.mode != editedCurrency.mode
        || funiter.currency.uPerDay != editedCurrency.uPerDay
        || funiter.currency.revaluationTime != editedCurrency.revaluationTime
        || funiter.currency.stepTime != editedCurrency.stepTime;
})

const updateCurrency = () => {
    const { expression, mode, uPerDay, revaluationTime, stepTime } = editedCurrency
    funiter.updateCurrency({ expression, mode, uPerDay, revaluationTime, stepTime })
}

onMounted(() => {
    Object.assign(editedCurrency, funiter.currency)
})

</script>