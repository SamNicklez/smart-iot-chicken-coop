import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin, AvatarPlugin, ProgressPlugin, ListGroupPlugin, BadgePlugin} from 'bootstrap-vue'
import 'vuetify/dist/vuetify.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueTimeline from "@growthbunker/vuetimeline";


Vue.config.productionTip = false
Vue.use(VueTimeline)
Vue.use(BadgePlugin)
Vue.use(BootstrapVue)
Vue.use(AvatarPlugin)
Vue.use(IconsPlugin)
Vue.use(ProgressPlugin)
Vue.use(ListGroupPlugin)
new Vue({
  render: h => h(App),
}).$mount('#app')
