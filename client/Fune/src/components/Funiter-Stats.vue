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
        <div class="w-100">
            <div class="d-inline-block ml-4">
                100
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
            <div class="custom-control custom-switch d-inline-block mr-2" style="float: right;">
                <input type="checkbox" class="custom-control-input" id="statsComparedToAverage" v-model="state.comparedToAverage">
                <label class="custom-control-label text-left" for="statsComparedToAverage" style="width: 50px; vertical-align: baseline;">
                    {{ state.comparedToAverage ? '%M/N' : 'Ü' }}
                </label>
            </div>
        </div>
    </div>
</template>


<script setup>
import { Trends } from './Trend.js'
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterStandalone.js'
import { defineProps, watch, onMounted, reactive } from 'vue'

const { colors } = defineProps({
    colors: Array,
})

const state = reactive({
    comparedToAverage: false,
    statType: 'day',
    stats: [],
})

watch(() => funiter.selectedAccounts.length,
    () => {
        getStats()
    }
)

watch(() => funiter.currency.elapsedTime,
    () => {
        getStats()
    }
)

watch(() => state.comparedToAverage, 
    () => {
        getStats()
    }
)

watch(() => state.statType, 
    () => {
        getStats()
    }
)

const getStats = () => {
    let funeStat = funiter.getAccountStats(funiter.name, state.statType)
    let stats = [funeStat]
    for (let index = 1; index < funiter.selectedAccounts.length; index++) {
        const account = funiter.selectedAccounts[index];
        if (account) {
            let stat = funiter.getAccountStats(account, state.statType)
            if (state.comparedToAverage) {
                for (let j = 0; j < stat.length; j++) {
                    stat[j] = funeStat[j] == 0 ? 0 : (stat[j] / funeStat[j]) * 100000;
                }
            }
            stats.push(stat)
        }
    }
    if (state.comparedToAverage) {
        stats[0] = new Array(funeStat.length).fill(100000)
    } 
    state.stats = stats
}

onMounted(() => {
    getStats()
})


</script>