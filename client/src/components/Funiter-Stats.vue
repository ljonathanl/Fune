<template>
    <div>
        <h4 class="text-center mb-3">
            <en>stats</en>
            <fr>stats</fr> 
        </h4>
        <trends
            :data="state.stats"
            :colors="state.colors"
            :padding="10"
            :radius="8"
            :stroke-width="1.4"
            :stroke-linecap="'butt'"
            :min="0"
            auto-draw
            smooth>
        </trends>
        <div class="input-group mx-auto mt-1" style="max-width: 400px">
            <label class="input-group-text px-1">
                100
            </label>
            <select v-model="state.statType" class="form-control px-1">
                <option value="day">
                    <en>days</en>
                    <fr>jours</fr>
                </option>
                <option value="month">
                    <en>months</en>
                    <fr>mois</fr>
                </option>
                <option value="year">
                    <en>years</en>
                    <fr>années</fr>
                </option>
            </select>
            <label class="input-group-text px-1">  
                <en>referential</en>
                <fr>référentiel</fr>
            </label>
            <select v-model="state.referential" class="form-control px-1">
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
            <label class="input-group-text p-1"></label> 
        </div>
    </div>
</template>


<script setup>
import { Trends } from './Trend.js'
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import { watch, onMounted, reactive } from 'vue'


const state = reactive({
    referential: 'relative',
    statType: 'day',
    stats: [],
    colors: []
})

const getStats = () => {
    let funeStat = funiter.getAccountStats(funiter.name, state.statType)
    let stat = null
    let stats = []
    let colors = []
    funiter.selectedAccounts.forEach((account, name) => {
        if (name != funiter.name) {
            stat = funiter.getAccountStats(name, state.statType)
            if (stat) {
                if (state.referential == 'average') {
                    for (let j = 0; j < stat.length; j++) {
                        stat[j] = funeStat[j].average == 0 ? 0 : (stat[j] / funeStat[j].average) * 100000;
                    }
                } else if (state.referential == 'quantitative') {
                    for (let j = 0; j < stat.length; j++) {
                        stat[j] = stat[j] * (funeStat[j].quantitative / funiter.currency.quantitative)
                    }
                }
                stats.push(stat)
                colors.push(account.color)
            }
        }
    })

    if (state.referential == 'average') {
        stat = new Array(funeStat.length).fill(100000)
    } else if (state.referential == 'relative') {
        stat = funeStat.map(c => {
            return c.average
        })
    } else if (state.referential == 'quantitative') {
        stat = funeStat.map(c => {
            return c.average * (c.quantitative / funiter.currency.quantitative)
        })
    }
    stats.push(stat)
    colors.push(funiter.selectedAccounts.get(funiter.name).color)
    state.stats = stats
    state.colors = colors
}

watch(() => funiter.selectedAccounts, getStats, { deep: true })

watch(() => funiter.currency, getStats, { deep: true })

watch(() => state.referential,  getStats)

watch(() => state.statType,  getStats)

onMounted(getStats)


</script>