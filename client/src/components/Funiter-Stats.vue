<template>
    <div>
        <h4 class="text-center">
            <en>stats</en>
            <fr>stats</fr> 
        </h4>
        <trends
            :data="state.stats"
            :colors="colors"
            :padding="10"
            :radius="8"
            :stroke-width="1"
            :stroke-linecap="'butt'"
            :min="0"
            auto-draw
            smooth>
        </trends>
        <div class="w-100 d-flex justify-content-between">
            <div class="input-group w-auto ml-4">
                <label class="input-group-text">
                    100
                </label>
                <select v-model="state.statType">
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
            </div>
            <div class="ms-auto w-auto input-group mr-4">
                <label class="input-group-text">  
                    <en>referential</en>
                    <fr>référentiel</fr>
                </label>
                <select v-model="state.referential">
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
            </div>
        </div>
    </div>
</template>


<script setup>
import { Trends } from './Trend.js'
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import { defineProps, watch, onMounted, reactive } from 'vue'

const { colors } = defineProps({
    colors: Array,
})

const state = reactive({
    referential: 'relative',
    statType: 'day',
    stats: [],
})

const getStats = () => {
    let funeStat = funiter.getAccountStats(funiter.name, state.statType)
    let stats = [[]]
    for (let index = 1; index < funiter.selectedAccounts.length; index++) {
        const account = funiter.selectedAccounts[index];
        if (account) {
            let stat = funiter.getAccountStats(account, state.statType)
            if (state.referential == 'average') {
                for (let j = 0; j < stat.length; j++) {
                    stat[j] = funeStat[j].average == 0 ? 0 : (stat[j] / funeStat[j].average) * 100000;
                }
            } else if (state.referential == 'quantitative') {
                for (let j = 0; j < stat.length; j++) {
                    stat[j] = stat[j] * funeStat[j].quantitative;
                }
            }
            stats.push(stat)
        }
    }

    if (state.referential == 'average') {
        stats[0] = new Array(funeStat.length).fill(100000)
    } else if (state.referential == 'relative') {
        stats[0] = funeStat.map(c => {
            return c.average
        })
    } else if (state.referential == 'quantitative') {
        stats[0] = funeStat.map(c => {
            return c.average * c.quantitative
        })
    }
    state.stats = stats
}

watch(() => funiter.selectedAccounts.length, getStats)

watch(() => funiter.currency, getStats, { deep: true })

watch(() => state.referential,  getStats)

watch(() => state.statType,  getStats)



onMounted(() => {
    getStats()
})


</script>