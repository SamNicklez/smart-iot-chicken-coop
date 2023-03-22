<script>
import { Line as LineChartGenerator } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
  } from 'chart.js'
  
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
  )
  
  export default {
    components: {
      LineChartGenerator
    },
  /**
   * Data that is used in the program
   */
  data() {
    return {
      currentTemp: 0, //Current temperature of the given coop
      currLight: true, //If the current level of light is adequate
      isAdmin: false, //If user is an admin, if true, can access settings menu
      chartData: {
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July'
          ],
          datasets: [
            {
              label: 'Data One',
              data: [40, 39, 10, 40, 39, 150, 40],
              borderColor: '#FF0000',
              backgroundColor: '#FF0000',
            },
          ],
        },
        chartOptions: {
          responsive: true,
          maintainAspectRatio: true,
        },
    }
  },
  /**
   * Runs of the load of the webpage
   */
  created() {
  },
  /**
   * All methods needed to run web app
   */
  methods: {
    /**
     * Checks if the user is using a mobile device or not
     * @returns {bool} true if the device is a mobile phone
     */
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    /**
     * Checks if the light in the chicken coop is adequate or not
     * @returns {String} "Adequate" or "Too Low" depending on the number given
     */
    checkLight() {
      if (this.currLight > 5) {
        return "Adequate";
      }
      else {
        return "Too Low";
      }
    },
    /**
     * Opens the settings modal on button click
     */
    clickSettings() {

    },
    /**
     * Opens the account modal on button click
     */
    clickAccount() {

    },
    /**
     * Opens the notification modal on button click
     */
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
          <b-card class="optionsCard" header="Graph Options">
            <div style="align-items: center;">
            </div>
          </b-card>
          <div class="chart">
            <LineChartGenerator :chart-options="chartOptions" :chart-data="chartData"/>
          </div>
          <b-card class="coopCard" header="Coop View">
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

.chart {
  float: left;
  width: 50%;
  margin-right: 1%;
}

.optionsCard {
  float: left;
  width: 12.5%;
  min-height: 70vh;
  margin-right: 1%;
}

.coopCard {
  float: left;
  width: 35.5%;
  min-height: 70vh;
}

.bottomCard {
  display: flex;
  flex-wrap: wrap;
  min-height: 70vh;
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
