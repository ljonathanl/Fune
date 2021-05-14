<template>
  <nav class="navbar navbar-dark bg-dark w-100">
    <div class="text-right mx-auto" style="width: 400px">
      <span @click="toTop()" class="pointer bg-primary px-1 display-6 position-absolute" style="font-family: monospace;left: 0.5em;" :title="funiter.name">fї</span>
      <button class="btn btn-outline-primary" @click="funiter.play()" v-if="!funiter.isPlaying" style="width: 120px" >
        <i class="fa fa-play"></i>
        <en> play</en>
        <fr> lecture</fr>
      </button>
      <button class="btn btn-outline-light" @click="funiter.stop()" v-if="funiter.isPlaying" style="width: 120px">
        <i class="fa fa-pause"></i>
        <en> pause</en>
        <fr> pause</fr>
      </button>
      <button class="btn btn-outline-light mx-3" v-longclick="stepForward" :disabled="funiter.isPlaying">
        <i class="fa fa-step-forward"></i>
        <en> next</en>
        <fr> suivant</fr>
      </button>
    </div>
  </nav>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { fr, en } from './Translate.js'


const stepForward = () => {
  funiter.play(false)
}

const toTop = () => {
  window.scroll(0,0)
}

</script>