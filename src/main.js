import Vue from 'vue'
import MyApp from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(MyApp),
}).$mount('#root')
