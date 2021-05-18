<template>
  <nav class="navbar navbar-dark bg-dark w-100 control">
    <div class="d-flex mx-auto align-items-center justify-content-end text-right pointer" style="width: 400px">
      <img src="/favicon64x64.png" class="icon mr-auto ml-1 pointer" @click="toTop()"/>

      <span>
        {{ translateTime(funiter.creationPeriod) }}
      </span>

      <span class="ml-1 display-5 font-monospace mr-2">{{ (1000 >= funiter.currency.elapsedTime) ? ('000' + funiter.currency.elapsedTime).slice(-3) : funiter.currency.elapsedTime }} </span>
      
      <div class="input-group d-inline ml-1 mr-3 w-auto">
        <button class="btn btn-outline-light bg-light text-dark btn-sm pr-1 pl-2 emboss" v-longclick="stepBackward" :disabled="funiter.isPlaying">
          <i class="fa fa-step-backward"></i>
        </button>
        <button class="btn btn-outline-light bg-dark text-light btn-sm pl-1 pr-2 emboss" v-longclick="stepForward" :disabled="funiter.isPlaying">
          <i class="fa fa-step-forward"></i>
        </button>
      </div>

      <button class="btn btn-primary mr-2 emboss" @click="funiter.play()" v-if="!funiter.isPlaying" style="width: 63px" >
        <i class="fa fa-play"></i>
      </button>
      <button class="btn btn-light mr-2 emboss" @click="funiter.stop()" v-if="funiter.isPlaying" style="width: 63px" >
        <i class="fa fa-pause"></i>
      </button>
      
    </div>
  </nav>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { fr, en, translateTime } from './Translate.js'
import { ref, onMounted } from 'vue'

const stepForward = () => {
  funiter.play(false)
}

const stepBackward = () => {
  funiter.unplay()
}

const toTop = () => {
  window.scroll(0,0)
}
</script>
