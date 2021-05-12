<template>
  <div class="mb-3 text-center">
    <label class="btn btn-dark mb-0" :class="{ disabled: funiter.isPlaying }">
      <i class="fa fa-upload"></i>
      <en> load</en>
      <fr> charger</fr>
      <input type="file" hidden @change="readSingleFile">
    </label>
    <button class="btn btn-light text-dark" @click="save()" :disabled="funiter.isPlaying">
      <i class="fa fa-download"></i>
      <en> save</en>
      <fr> sauvegarder</fr>
    </button>
    <button class="btn btn-danger ml-3" @click="funiter.reset()">
      <i class="fa fa-undo"></i>
      <en> reset</en>
      <fr> RAZ</fr>
    </button>
  </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
import jsonc from '../lib/JSONC.js'
import { saveAs } from 'file-saver'
import { fr, en, translate } from './Translate.js'

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