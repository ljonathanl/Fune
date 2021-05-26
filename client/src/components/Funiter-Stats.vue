<template>
    <div class="position-relative">
        <h4 class="text-center mb-3">
            <en>stats</en>
            <fr>stats</fr>
            <info-button class="position-absolute" info="info-stats" /> 
        </h4>
        <info infoId="info-stats">
            <en>EN_info-stats</en>
            <fr>FR_info-stats</fr>
        </info>
        <div :title="title">
            <trends
                class="p-2 stats"
                :data="state.stats"
                :colors="state.colors"
                :padding="10"
                :radius="8"
                :stroke-width="1.4"
                :stroke-linecap="'butt'"
                :minX="state.beginStat"
                :minY="0"
                :xUnit="state.xUnit"
                :yUnit="state.yUnit"
                @mousemove="refreshTitle"
                ref="stats"
                auto-draw
                smooth>
            </trends>
        </div>
        <div class="input-group mx-auto mt-3 mb-1" style="max-width: 350px">
            <label class="input-group-text px-1">  
                <en>referential</en>
                <fr>référentiel</fr>
            </label>
            <select v-model="state.referential" class="form-control px-1 select-text-center">
                <option value="relative">
                    <en>relative</en>
                    <fr>relatif</fr>
                </option>
                <option value="quantitative">
                    <en>quantitative</en>
                    <fr>quantitatif</fr>
                </option>
                <option value="average">
                    <en>average</en>
                    <fr>moyenne</fr>
                </option>
            </select>
            <button type="button" class="btn btn-secondary" @click="exportAsCSV()">
                <i class="fa fa-table"></i>
                <en> export</en>
                <fr> exporter</fr>
            </button>
        </div>
    </div>
</template>


<script setup>
import { Trends } from './Trend.js'
import { fr, en, translateTime } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import info from './Info.vue'
import lodash from 'lodash'
import infoButton from './Info-Button.vue'
import { ref, watch, onMounted, reactive } from 'vue'
import { saveAs } from 'file-saver'

const stats = ref(null)

const title = ref('-------------')

let time = lodash.now()

const refreshTitle = (event) => {
    const pt = stats.value.getCoordinates(event.clientX, event.clientY)
    const now = lodash.now()
    if (!pt || now - time < 100) {
        return
    }
    time = now
    const T = (pt.x + state.beginStat)
    title.value = funiter.currencyDecimal(pt.y) + ' ' + state.yUnit + '\n' + 
        'T: ' + T  + ' ' + translateTime(funiter.creationPeriod, T) + '\n' +
        translateCurrency(state.funeStat[pt.x])
}


const state = reactive({
    referential: 'relative',
    stats: [],
    accounts: [],
    colors: [],
    xUnit: '',
    yUnit: 'Ü',
    beginStat: 0,
    funeStat: [null]
})

const translateCurrency = (currency) => {
    if (!currency) return ''
    return 'M: ' + funiter.currencyDecimal(currency.monetaryMass) + ' Ü' + '\n' +
        'N: ' + currency.nbMembers + ' Üm.' + '\n' +
        'M/N: ' + funiter.currencyDecimal(currency.average) + ' Ü' + '\n' +
        'D: ' + currency.lastMelt + ' %' + '\n' 
}

const getStats = () => {
    state.xUnit = funiter.currency.elapsedTime + ' ' + translateTime(funiter.creationPeriod, funiter.currency.elapsedTime)
    let funeStat = funiter.getAccountStats(funiter.name)
    let stat = null
    let stats = []
    let colors = []
    let accounts = []
    funiter.selectedAccounts.forEach((account, name) => {
        if (name != funiter.name) {
            stat = funiter.getAccountStats(name)
            if (stat) {
                if (state.referential == 'average') {
                    for (let j = 0; j < stat.length; j++) {
                        stat[j] = funeStat[j].average == 0 ? 0 : (stat[j] / funeStat[j].average) * 100000
                    }
                } else if (state.referential == 'quantitative') {
                    for (let j = 0; j < stat.length; j++) {
                        stat[j] = stat[j] * (funeStat[j].quantitative / funiter.currency.quantitative)
                    }
                }
                stats.push(stat)
                accounts.push(name)
                colors.push(account.color)
            }
        }
    })

    if (state.referential == 'average') {
        state.yUnit = '% M/N'

        // Ü / (M/N)
        stat = funeStat.map(c => {
            return c.average == 0 ? 0 : ((c.uPerTime * c.revaluationTime *  1000)  / c.average) * 100000
        })
        stats.push(stat)
        colors.push("#99999955")

        stat = new Array(funeStat.length).fill(100000)
    } else if (state.referential == 'relative') {
        state.yUnit = 'Ü'
        stat = funeStat.map(c => {
            return c.average
        })
    } else if (state.referential == 'quantitative') {
        state.yUnit = 'Ü(0) / Ü'
        stat = funeStat.map(c => {
            return c.average * (c.quantitative / funiter.currency.quantitative)
        })
    }
    stats.push(stat)
    colors.push(funiter.selectedAccounts.get(funiter.name).color)
    state.stats = stats
    state.colors = colors
    state.funeStat = funeStat
    state.beginStat = funeStat[0].elapsedTime
    state.accounts = accounts
}

const getGrew = (melt) => {
    if (melt == 0)
        return (0).toFixed(2)
    return ((1 / (1 / (melt / 100) - 1)) * 100).toFixed(2)
}

const exportAsCSV = () => {
    let csv = 'currency;' + 
        '"U per time: ' + funiter.currency.uPerTime + '";' + 
        '"revaluation period: ' + funiter.currency.revaluationTime + '";' +
        '"expression: ' + (funiter.currency.mode == 'melt' ? 'U(t-r) = ( 1 - ' : 'U(t+r) = ( 1 + ') + funiter.currency.expression + ' ) U(t)";' + '\n' +
        'referential;' + state.referential + ';\n'
        '\n;;\n;;'
    
    csv += 'time;M;N;C;D;M/N;'

    for (let index = 0; index < state.accounts.length; index++) {
        csv += '"' + state.accounts[index] + '";';
    }

    csv += '\n'

    for (let i = 0; i < state.funeStat.length; i++) {
        let currency = state.funeStat[i]
        csv += currency.elapsedTime + ';' + 
            funiter.currencyDecimal(currency.monetaryMass) + ';' +
            currency.nbMembers + ';' +
            getGrew(currency.lastMelt) + ';' +
            currency.lastMelt.toFixed(2) + ';' +
            funiter.currencyDecimal(currency.average) + ';'

        for (let j = 0; j < state.accounts.length; j++) {
            csv += funiter.currencyDecimal(state.stats[j][i]) + ';'
        }
        csv += '\n'
    }

    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"})
    saveAs(blob, "fune_" + new Date().toISOString().substring(0,16) + ".csv")
} 

watch(() => funiter.selectedAccounts, getStats, { deep: true })

watch(() => funiter.currency, getStats, { deep: true })

watch(() => [state.referential, funiter.creationPeriod],  getStats)

onMounted(() => {
    getStats()
})


</script>