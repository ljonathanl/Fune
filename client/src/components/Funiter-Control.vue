<template>
  <nav class="navbar navbar-dark bg-dark">
    <div class="text-center w-100 my-2">
      <button class="btn btn-outline-primary" @click="funiter.play()" :disabled="funiter.isPlaying">
        <i class="fa fa-play"></i>
        <en> play</en>
        <fr> lecture</fr>
      </button>
      <button class="btn btn-outline-light mx-3" v-longclick="stepForward" :disabled="funiter.isPlaying">
        <i class="fa fa-step-forward"></i>
        <en> next</en>
        <fr> suivant</fr>
      </button>
      <button class="btn btn-outline-light" @click="funiter.stop()" :disabled="!funiter.isPlaying">
        <i class="fa fa-pause"></i>
        <en> pause</en>
        <fr> pause</fr>
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

</script>