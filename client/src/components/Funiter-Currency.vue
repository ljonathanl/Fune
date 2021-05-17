<template>
    <div>
        <h4 class="text-center mb-3">
            <en>currency</en>
            <fr>monnaie</fr>
            <info-button class="position-absolute" info="info-currency" />
        </h4>
        <info infoId="info-currency">
            <en>EN_info-currency</en>
            <fr>FR_info-currency</fr>
        </info>
        <form>
            <!-- <div class="input-group mb-1">
                <label class="input-group-text">
                    <en>Ü revaluation</en>
                    <fr>réévaluation de Ü</fr>
                </label>
                <select v-model="editedCurrency.mode" id="currencyMode" class="form-control select-text-center"
                    :class="{'bg-primary': editedCurrency.mode != funiter.currency.mode}" :disabled="funiter.isPlaying">
                    <option value="melt">
                        <en>melting</en>
                        <fr>fonte</fr>
                    </option>
                    <option value="grew">
                        <en>growth</en>
                        <fr>croissance</fr>
                    </option>
                </select>
                <label class="input-group-text pr-1">
                    <info-button class="px-0" info="info-currency-mode" />
                </label>
            </div>
            <info infoId="info-currency-mode">
                <en>EN_info-currency-mode</en>
                <fr>FR_info-currency-mode</fr>
            </info>   -->
            
            <div class="input-group mb-1">
                <label class="input-group-text" for="currencyUPerTime">
                    <en>Ü per </en>
                    <fr>Ü par </fr>
                    {{ translateTime(funiter.creationPeriod) }}
                </label>
                <input id="currencyUPerTime" v-model="editedCurrency.uPerTime" type="number" min="0" max="1000" step="1" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.uPerTime != funiter.currency.uPerTime}" :disabled="funiter.isPlaying">
                <span class="input-group-text pr-1">Ü
                   <info-button class="px-0 ml-2" info="info-currency-uPerTime" /> 
                </span>
            </div>
            <info infoId="info-currency-uPerTime">
                <en>EN_info-currency-uPerTime</en>
                <fr>FR_info-currency-uPerTime</fr>
            </info> 
            <div class="input-group mb-1">
                <label class="input-group-text" for="currencyRevaluationTime">
                    <en>revaluation (r)</en>
                    <fr>réévaluation (r)</fr>
                </label>
                <input id="currencyRevaluationTime" v-model="editedCurrency.revaluationTime" type="number" min="1" max="400" step="1" class="form-control text-right" 
                    :class="{'bg-primary': editedCurrency.revaluationTime != funiter.currency.revaluationTime}" :disabled="funiter.isPlaying">
                <span class="input-group-text pr-1">
                    {{ translateTime(funiter.creationPeriod, editedCurrency.revaluationTime) }}
                    <info-button class="px-0 ml-2" info="info-currency-revaluationTime" />
                </span>
            </div>
            <info infoId="info-currency-revaluationTime">
                <en>EN_info-currency-revaluationTime</en>
                <fr>FR_info-currency-revaluationTime</fr>
            </info>

            <div class="input-group mb-1">
                <select v-model="editedCurrency.mode" id="currencyMode" class="form-control select-text-center"
                    :class="{'bg-primary': editedCurrency.mode != funiter.currency.mode}" :disabled="funiter.isPlaying">
                    <option value="melt">
                        Ü(t-r) = ( 1 - 
                    </option>
                    <option value="grew">
                        Ü(t+r) = ( 1 + 
                    </option>
                </select>
                <!-- <span class="input-group-text" v-if="editedCurrency.mode == 'melt'">Ü(t-1) = ( 1 - </span>
                <span class="input-group-text" v-else>Ü(t+1) = ( 1 + </span> -->
                <input id="currencyExpression" v-model="editedCurrency.expression" type="text" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.expression != funiter.currency.expression}" :disabled="funiter.isPlaying">
                <span class="form-control px-1 text-left" style="flex-grow: 0.71;">
                     ) Ü(t)
                    <info-button class="px-0 ml-2" info="info-currency-expression" />    
                </span>    
            </div>
            <info infoId="info-currency-expression">
                <en>EN_info-currency-expression</en>
                <fr>FR_info-currency-expression</fr>
            </info> 
            <!-- <div class="input-group mb-1">
                <label class="input-group-text" for="currencyStepTime">
                    <en>day duration</en>
                    <fr>durée d'un jour</fr>
                </label>
                <input id="currencyStepTime" v-model="editedCurrency.stepTime" type="number" min="1" max="90000" step="1" class="form-control text-right"
                    :class="{'bg-primary': editedCurrency.stepTime != funiter.currency.stepTime}" :disabled="funiter.isPlaying">
                <span class="input-group-text pr-1">
                    <en>second<span v-if="editedCurrency.stepTime > 1">s</span></en>
                    <fr>seconde<span v-if="editedCurrency.stepTime > 1">s</span></fr>
                    <info-button class="px-0 ml-2" info="info-currency-stepTime" />
                </span>
            </div>
            <info infoId="info-currency-stepTime">
                <en>EN_info-currency-stepTime</en>
                <fr>FR_info-currency-stepTime</fr>
            </info> -->

            <div class="d-flex align-items-start flex-wrap mb-1" style="justify-content: space-evenly;" v-if="currencyChange">
                <button type="button" class="btn btn-secondary mr-auto" @click="Object.assign(editedCurrency, funiter.currency)">
                    <en>ündo!</en>
                    <fr>annüler!</fr>
                </button>
                <button type="button" class="btn btn-primary" @click="updateCurrency()">
                    <en>üpdate!</en>
                    <fr>valïder!</fr>
                </button>
            </div>

            <!-- <div class="input-group mb-1 mt-3">
                <label class="input-group-text" for="currencyElapsedTime">
                    <en>elapsed time (T)</en>
                    <fr>temps écoulé (T)</fr>
                </label>
                <input id="currencyElapsedTime" v-model="funiter.currency.elapsedTime" type="text" class="form-control text-right" disabled>
                <span class="input-group-text">
                    <en>day<span v-if="funiter.currency.elapsedTime > 1">s</span></en>
                    <fr>jour<span v-if="funiter.currency.elapsedTime > 1">s</span></fr>
                </span>
            </div> -->

            <div class="input-group mb-1 mt-3">
                <button type="button" class="btn btn-secondary form-control text-left" @click="more = true" v-if="!more">
                    <en>more data</en>
                    <fr>plus de données</fr>
                    <i class="fa fa-plus-square position-absolute end-0 mr-3 pt-1"></i>
                </button>
                <button type="button" class="btn btn-secondary form-control text-left" @click="more = false" v-else>
                    <en>less data</en>
                    <fr>moins de données</fr>
                    <i class="fa fa-minus-square position-absolute end-0 mr-3 pt-1"></i>
                </button>
            </div>

            <div v-if="more">
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyMass">
                        <en>monetary mass (M)</en>
                        <fr>masse monétaire (M)</fr>
                    </label>
                    <input id="currencyMass" :value="funiter.currencyWithoutDecimal(funiter.currency.monetaryMass)" type="text" class="form-control text-right" disabled>
                    <span class="input-group-text">Ü</span>
                </div>
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyNbMembers">
                        <en>Üman accounts (N)</en>
                        <fr>comptes Ümains (N)</fr>
                    </label>
                    <input id="currencyNbMembers" :value="funiter.currency.nbMembers" type="text" class="form-control text-right" disabled>
                </div>
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyAvg">
                        <en>average</en>
                        <fr>moyenne</fr>
                    </label>
                    <input id="currencyAvg" :value="funiter.currencyDecimal(funiter.currency.average)" type="text" class="form-control text-right" disabled>
                    <span class="input-group-text">
                        <en>Ü / Üman</en>
                        <fr>Ü / Ümain</fr>
                    </span>
                </div>
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyQuantitative">
                        <en>quantitative</en>
                        <fr>quantitatif</fr>
                    </label>
                    <input id="currencyQuantitative" :value="displayQuantitative(funiter.currency.quantitative)" type="text" class="form-control text-right" disabled>
                    <span class="input-group-text">
                        <en>Ü / Ü(0)</en>
                        <fr>Ü / Ü(0)</fr>
                    </span>
                </div>
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyLastGrew">
                        <en>last growth</en>
                        <fr>dernière croissance</fr>
                    </label>
                    <input id="currencyLastGrew" :value="lastGrew" type="text" class="form-control text-right" disabled>
                    <span class="input-group-text">%</span>
                </div>
                <div class="input-group mb-1">
                    <label class="input-group-text" for="currencyLastMelt">
                        <en>last melting</en>
                        <fr>dernière fonte</fr>
                    </label>
                    <input id="currencyLastMelt" :value="funiter.currency.lastMelt" type="text" class="form-control text-right" disabled>
                    <span class="input-group-text">%</span>
                </div>
            </div>

            
            
        </form> 
    </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { fr, en, translateTime } from './Translate.js'
import info from './Info.vue'
import infoButton from './Info-Button.vue'
import { ref, reactive, computed, onMounted, watch } from 'vue'

const more = ref(false)

const editedCurrency = reactive({
    expression: '',
    mode: 'melt',
    uPerTime: 1,
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
        || funiter.currency.uPerTime != editedCurrency.uPerTime
        || funiter.currency.revaluationTime != editedCurrency.revaluationTime;
})

const updateCurrency = () => {
    const { expression, mode, uPerTime, revaluationTime } = editedCurrency
    funiter.updateCurrency({ expression, mode, uPerTime, revaluationTime })
}

const displayQuantitative = (value) => {
    if (value < 1000000) {
        return value.toFixed(2)
    }

    return value.toExponential(3)
}

watch(() => [
    funiter.currency.expression,
    funiter.currency.mode,
    funiter.currency.uPerTime,
    funiter.currency.revaluationTime
], () => {
    Object.assign(editedCurrency, funiter.currency)
})

onMounted(() => {
    Object.assign(editedCurrency, funiter.currency)
})

</script>