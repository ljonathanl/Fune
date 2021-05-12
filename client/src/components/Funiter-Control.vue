<template>
  <div class="text-center"> 
    <button class="btn btn-primary" @click="funiter.play()" :disabled="funiter.isPlaying"><i class="fa fa-play"></i> play</button>
    <button class="btn btn-secondary" v-longclick="stepForward" :disabled="funiter.isPlaying"><i class="fa fa-step-forward"></i> next</button>
    <button class="btn btn-secondary mr-5" @click="funiter.stop()" :disabled="!funiter.isPlaying"><i class="fa fa-pause"></i> pause</button>


    <label class="btn btn-dark mb-0">
      <i class="fa fa-upload"></i> load<input type="file" hidden @change="readSingleFile">
    </label>
    <button class="btn btn-light text-dark" @click="save()"><i class="fa fa-download"></i> save</button>

    <button class="btn btn-danger mx-5" @click="funiter.reset()"><i class="fa fa-undo"></i> reset</button>
  </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import jsonc from '../lib/JSONC.js'
import { saveAs } from 'file-saver'


const stepForward = () => {
  funiter.play(false)
}

const save = () => {
  const state = funiter.getState()
  const json = JSON.stringify(state)
  var lzwString = jsonc.pack( state, true )
  var blob = new Blob([lzwString], {type: "text/plain;charset=utf-8"})
  saveAs(blob, "fune_" + new Date().toISOString().substring(0,16) + ".fun")
}

const readSingleFile = (evt) => {
  const f = evt.target.files[0] 

  if (f) {
    const r = new FileReader()
    r.onload = function(e) { 
      var content = e.target.result
      load(content)
    }
    r.readAsText(f)
  } else { 
    alert('failed to load file')
  }

  evt.target.value = null
}

const load = (content) => {
  try {
    const state = jsonc.unpack(content, true)
    console.log(state)
    funiter.stop()
    funiter.restoreState(state)
  } catch (e) {
    console.log(e)
    alert('failed to load file')
  }
}

</script>