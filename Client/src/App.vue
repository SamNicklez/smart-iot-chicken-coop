<script>
import LineChart from './components/LineGraph.vue'
export default {
  name: 'App',
  components: {
    LineChart
  },
  data() {
    
    return {
      currentTemp: 0,
      currLight: true,
      isAdmin: false,
    }
  },
  created() {
  },
  methods: {
    /**
     * checks if the user is using a mobile device or not
     */
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    checkLight() {
      if (this.currLight > 5) {
        return "Adequate";
      }
      else {
        return "Too Low";
      }
    },
    clickSettings() {

    },
    clickAccount() {

    },
    clickNoti() {

    }
  },
}
</script>

<template>
  <div v-if="!isMobile()">
    <div class="mainContainer">
      <b-card class="mainCard">
        <b-card class="topCard">
          <b-button-group style="float: right; position: relative;">
            <b-list-group horizontal="md" style="margin-right: 6vw;">
              <b-list-group-item style="font-size: 1.5vw; width: 25vw;">Currernt Temperature: {{ this.currentTemp
              }}&#x2109;</b-list-group-item>
              <b-list-group-item style="font-size: 1.5vw; width: 25vw">Currernt Light Level: {{ this.checkLight()
              }}</b-list-group-item>
            </b-list-group>
            <b-button @click="clickSettings" variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="tools"></b-icon> Settings
            </b-button>
            <b-button @click="clickAccount" variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="person-fill"></b-icon> Account
            </b-button>
            <b-button @click="clickNoti" variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="inbox-fill"></b-icon> Notifications
            </b-button>
          </b-button-group>
        </b-card>
        <b-card class="bottomCard">
          <b-card class="optionsCard">
            <b-button>Options</b-button>
            <b-button>Options</b-button>
            <b-button>Options</b-button>
            <b-button>Options</b-button>
            <b-button>Options</b-button>
          </b-card>
          <LineChart style="width: 40vw; height: 70vh; margin-left: 11.6vw;"/>
          <b-card class="coopCard">
            Stuff
          </b-card>
        </b-card>
      </b-card>
    </div>
  </div>
  <div v-else>
    Mobile sucks
  </div>
</template>

<style>
.mainContainer {
  min-height: 100vh;
  overflow-y: hidden;
  background-color: #fafafa !important;
}
.optionsCard{
  float: left;
  width: 10vw;
  min-height: 70vh;
  margin-right: 20px;
  
}
.coopCard{
  flex: 2;
  width: 10vw;
  min-height: 50vh;
  float: right;

}
.bottomCard {
  display: flex;
  min-height: 75vh;
  margin-top: 2vh;
}

.mainCard {
  display: flex;
  min-height: 95vh;
  min-width: 95vw;
  background-color: #d2d3db !important;
  margin-top: 2.5vh;
  margin-right: 2.5vh;
  margin-left: 2.5vh;
}

.topCard {
  display: block;
  font-family: "Verdana", Times, Sans-serif;
  background-color: #fafafa !important;
}
</style>
