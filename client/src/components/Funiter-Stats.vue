<template>
    <div>
        <h4 class="text-center mb-3">
            <en>stats</en>
            <fr>stats</fr>
            <info-button class="position-absolute" info="info-stats" /> 
        </h4>
        <info infoId="info-stats">
            <en>EN_info-stats</en>
            <fr>FR_info-stats</fr>
        </info>
        <trends
            class="p-2 stats"
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
        <div class="input-group mx-auto mt-3 mb-1" style="max-width: 220px">
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
            <label class="input-group-text p-1">
                <info-button class="px-0" info="info-stats-referential" />
            </label>
        </div>
        <info infoId="info-stats-referential">
            <en>EN_info-stats-referential</en>
            <fr>FR_info-stats-referential</fr>
        </info>
    </div>
</template>


<script setup>
import { Trends } from './Trend.js'
import { fr, en } from './Translate.js'
import funiter from '../lib/funiterReactive.js'
import info from './Info.vue'
import infoButton from './Info-Button.vue'
import { watch, onMounted, reactive } from 'vue'


const state = reactive({
    referential: 'relative',
    stats: [],
    colors: []
})

const getStats = () => {
    let funeStat = funiter.getAccountStats(funiter.name)
    let stat = null
    let stats = []
    let colors = []
    funiter.selectedAccounts.forEach((account, name) => {
        if (name != funiter.name) {
            stat = funiter.getAccountStats(name)
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

onMounted(getStats)


</script>