import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import VueMapbox from 'vue-mapbox'
import Mapbox from 'mapbox-gl'
import wysiwyg from 'vue-wysiwyg'
import 'chart.js'
import 'vuetify/dist/vuetify.min.css'
import 'vue-wysiwyg/dist/vueWysiwyg.css'
import '@mdi/font/css/materialdesignicons.css'
import { apolloProvider } from './vue-apollo'
import DateTime from 'luxon/src/datetime.js'
import moment from 'moment'
import bowser from 'bowser'
import VueDragDrop from 'vue-drag-drop'

Vue.use(VueDragDrop)
Vue.use(VueChartkick, {
  Chartkick
})

Vue.use(VueMapbox, {
  mapboxgl: Mapbox
})
Vue.use(wysiwyg, {})

Vue.use(Vuetify)
Vue.config.productionTip = false

// Global Filters
Vue.filter('formatDate', function(date, DATE_SHORT) {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT)
})
Vue.filter('momentDate', function(date, format = 'MMMM Do YYYY, h:mm:ss a') {
  return date ? moment.utc(date).format(format) : ''
})

Vue.filter('toCurrency', function(value, currency = 'USD') {
  if (typeof value !== 'number') {
    return value
  }
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  })
  return formatter.format(value)
})
// Removing service worker since we dont use it
// At some point in the future we will want to use it
// and properly leverage it, but for now its just annoying
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

let parsedResult
let isMobile = false
try {
  const browser = bowser.getParser(window.navigator.userAgent)
  parsedResult = browser.parsedResult
  if (parsedResult.platform.type === 'mobile') {
    isMobile = true
  }
} catch (err) {
  // warn and set browser to something safe?
}

Vue.prototype.$browser = {
  isMobile,
  parsedResult
}

Vue.prototype.$moment = moment

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
}).$mount('#app')
