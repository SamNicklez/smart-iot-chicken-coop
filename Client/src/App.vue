<script>
export default {
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
    checkLight(){
      if(this.currLight > 5){
        return "Adequate";
      }
      else{
        return "Too Low";
      }
    },
    clickSettings(){
      console.log("BAD")
    }
  },
}
</script>

<template>
  <div v-if="!isMobile()">
    <div class="mainContainer">
      <b-card class="mainCard">
        <b-card class="topCard">
          <b style="font-size: 1.25vw;">Currernt Temperature: {{this.currentTemp}}&#x2109;</b>
          <b style="font-size: 1.25vw;">Currernt Light Level: {{this.checkLight()}}</b>
          <b-button-group style="float: right;">
            <b-button @click="clickSettings" variant="outline-primary">
              <b-icon icon="tools"></b-icon> Settings
            </b-button>
            <b-button variant="outline-primary">
              <b-icon icon="person-fill"></b-icon> Account
            </b-button>
            <b-button variant="outline-primary">
              <b-icon icon="inbox-fill"></b-icon> Notifications
            </b-button>
          </b-button-group>
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

.mainCard {
  min-height: 95vh;
  min-width: 95vw;
  background-color: #d2d3db !important;
  margin-top: 2.5vh;
  margin-right: 2.5vh;
  margin-left: 2.5vh;
}

.topCard {
  align-items:center !important;
  font-family: "Verdana", Times, Sans-serif;
  background-color: #fafafa !important;
}
</style>
