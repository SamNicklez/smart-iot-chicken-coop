import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin, AvatarPlugin, ProgressPlugin, ListGroupPlugin, BadgePlugin, SidebarPlugin,FormDatepickerPlugin, FormCheckboxPlugin, ModalPlugin, FormInputPlugin, FormRadioPlugin} from 'bootstrap-vue'
import 'vuetify/dist/vuetify.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { Line } from 'vue-chartjs'
import GAuth from 'vue-google-oauth2'
Vue.config.productionTip = false

Vue.use(GAuth, { clientId: '473159579419-8posa7no3h97h05n70u69htvqhq7g79h.apps.googleusercontent.com', plugin_name: "Web client 3"})
Vue.use(FormRadioPlugin)
Vue.use(ModalPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(SidebarPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(Line)
Vue.use(BadgePlugin)
Vue.use(BootstrapVue)
Vue.use(AvatarPlugin)
Vue.use(IconsPlugin)
Vue.use(ProgressPlugin)
Vue.use(ListGroupPlugin)
new Vue({
  render: h => h(App),
}).$mount('#app')
