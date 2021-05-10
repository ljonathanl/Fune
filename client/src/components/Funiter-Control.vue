<template>
  <div class="text-center"> 
    <button class="btn btn-primary" @click="funiter.play()" :disabled="funiter.isPlaying"><i class="fa fa-play"></i> play</button>
    <button class="btn btn-secondary mr-5" @click="funiter.stop()" :disabled="!funiter.isPlaying"><i class="fa fa-pause"></i> pause</button>
    <button class="btn btn-danger ml-5" @click="funiter.reset()"><i class="fa fa-refresh"></i> reset</button>
  </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'

</script>