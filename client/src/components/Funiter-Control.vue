<template>
  <nav class="navbar navbar-dark bg-dark w-100" ref="nav">
    <div class="d-flex mx-auto align-items-center justify-content-end text-right pointer" style="width: 400px">
      <div @click="toTop()" class="position-absolute icon" style="left: 1em;">
        <code class="bg-primary p-1 display-5 text-light" :title="funiter.name">fї</code>
        <span class="display-5 ml-2 align-bottom">f<small>Ü</small>ne</span>
      </div>

      <span class="ml-auto">
        <en>day</en>
        <fr>jour</fr>
      </span>
      <span class="ml-1 display-5 font-monospace mr-2">{{ (1000 >= funiter.currency.elapsedTime) ? ('000' + funiter.currency.elapsedTime).slice(-3) : funiter.currency.elapsedTime }} </span>
      
      <div class="input-group d-inline ml-1 mr-3 w-auto">
        <button class="btn btn-outline-light bg-light text-dark btn-sm pr-1 pl-2" v-longclick="stepBackward" :disabled="funiter.isPlaying">
          <i class="fa fa-step-backward"></i>
        </button>
        <button class="btn btn-outline-light bg-dark text-light btn-sm pl-1 pr-2" v-longclick="stepForward" :disabled="funiter.isPlaying">
          <i class="fa fa-step-forward"></i>
        </button>
      </div>

      <button class="btn btn-primary mr-1" @click="funiter.play()" v-if="!funiter.isPlaying" style="width: 63px" >
        <i class="fa fa-play"></i>
      </button>
      <button class="btn btn-light mr-1" @click="funiter.stop()" v-if="funiter.isPlaying" style="width: 63px" >
        <i class="fa fa-pause"></i>
      </button>
      
    </div>
  </nav>
</template>

<script>
const observer = new IntersectionObserver( 
  ([e]) => e.target.classList.toggle('isSticky', e.intersectionRatio < 1),
  {
    rootMargin: '-1px 0px 0px 0px',
    threshold: [1],
  }
)

</script>

<script setup>
import funiter from '../lib/funiterReactive.js'
import { fr, en } from './Translate.js'
import { ref, onMounted } from 'vue'

const nav = ref(null)

const stepForward = () => {
  funiter.play(false)
}

const stepBackward = () => {
  funiter.unplay()
}

const toTop = () => {
  window.scroll(0,0)
}

onMounted(() => {
  observer.observe(nav.value)
})

</script>

<style scoped>
.icon {
  display: none;
}

.isSticky .icon {
  display: inline;
}

</style>