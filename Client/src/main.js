import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin, AvatarPlugin, ProgressPlugin, ListGroupPlugin, BadgePlugin, SidebarPlugin,FormDatepickerPlugin, FormCheckboxPlugin, ModalPlugin, FormInputPlugin, FormRadioPlugin} from 'bootstrap-vue'
import 'vuetify/dist/vuetify.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { Line } from 'vue-chartjs'

Vue.use(FormRadioPlugin)
Vue.use(ModalPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(SidebarPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(Line)
Vue.config.productionTip = false
Vue.use(BadgePlugin)
Vue.use(BootstrapVue)
Vue.use(AvatarPlugin)
Vue.use(IconsPlugin)
Vue.use(ProgressPlugin)
Vue.use(ListGroupPlugin)
new Vue({
  render: h => h(App),
}).$mount('#app')
