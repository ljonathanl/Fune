import { createApp } from 'vue'
import App from './App.vue'
import longclick from './directives/longclick.js'

createApp(App).directive('longclick', longclick).mount('#app')
