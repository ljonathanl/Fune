<template>
  <div class="mb-3 text-center">
    <div class="input-group d-inline">
      <label class="btn btn-dark mb-0 emboss" :class="{ disabled: funiter.isPlaying }">
        <i class="fa fa-upload"></i>
        <en> load</en>
        <fr> charger</fr>
        <input type="file" hidden @change="readSingleFile">
      </label>
      <button class="btn btn-light text-dark emboss" @click="save()" :disabled="funiter.isPlaying">
        <i class="fa fa-download"></i>
        <en> save</en>
        <fr> sauvegarder</fr>
      </button>
    </div>
    <button class="btn btn-secondary ml-3 emboss" @click="funiter.reset()">
      <i class="fa fa-undo"></i>
      <en> reset</en>
      <fr> RAZ</fr>
    </button>
  </div>
</template>

<script setup>
import funiter from '../lib/funiterReactive.js'
// import jsonc from '../lib/JSONC.js'
import { saveAs } from 'file-saver'
import { fr, en, translate } from './Translate.js'

const save = () => {
  const state = funiter.getState()
  const json = JSON.stringify(state)
  // var lzwString = jsonc.pack( state, true )
  var blob = new Blob([json], {type: "text/plain;charset=utf-8"})
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
    alert(translate({ en: 'file not found', fr: 'fichier introuvable' }))
  }

  evt.target.value = null
}

const load = (content) => {
  try {
    // const state = jsonc.unpack(content, true)
    const state = JSON.parse(content)
    funiter.stop()
    funiter.restoreState(state)
  } catch (e) {
    console.log(e)
    alert(translate({ en: 'can not read the file', fr: 'le fichier ne peut pas être lu' }))
  }
}

</script>