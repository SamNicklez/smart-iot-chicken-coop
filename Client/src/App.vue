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
      currentTempDataset: { //The current dataset needed for graph
        label: 'Temperature',
        data: [70, 68, 65, 75, 78, 76, 77],
        borderColor: '#ffa600',
        backgroundColor: '#003f5c',
      },
      currLight: true, //If the current level of light is adequate
      currentLightDataset: { //The current dataset needed for graph
        label: 'Light Level',
        data: [6.66, 4.36, 10.23, 18.23, 20.55, 26.6, 23],
        borderColor: '#2f4b7c',
        backgroundColor: '#f95d6a',
      },
      currentEggDataset: { //The current dataset needed for graph
        label: 'Eggs',
        data: [1, 3, 5, 2, 7, 1, 5],
        borderColor: '#a05195',
        backgroundColor: '#d45087',
      },
      isAdmin: false, //If user is an admin, if true, can access settings menu
      startDate: this.subtractSeven(new Date()),
      endDate: new Date().toLocaleDateString(),
      selectedCheck: ['temp', 'egg', 'light'], // Must be an array reference!
      options: [
        { text: '  Temperature', value: 'temp' },
        { text: '  Eggs', value: 'egg' },
        { text: '  Light Level', value: 'light' },
      ],
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
            label: 'Temperature',
            data: [70, 68, 65, 75, 78, 76, 77],
            borderColor: '#ffa600',
            backgroundColor: '#003f5c',
          },
          {
            label: 'Eggs',
            data: [1, 3, 5, 2, 7, 1, 5],
            borderColor: '#a05195',
            backgroundColor: '#d45087',
          },
          {
            label: 'Light Level',
            data: [6.66, 4.36, 10.23, 18.23, 20.55, 26.6, 23],
            borderColor: '#2f4b7c',
            backgroundColor: '#f95d6a',
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        tension: .35,
      },
    }
  },
  /**
   * Runs of the load of the webpage
   */
  created() {
    //should grab the weekly statistics of temperature, eggs and light level
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
     * 
     * @param {DateTime} date is the date we want to subtract seven days from
     * @returns {string} The date in MM/DD/YYYY format with 7 days taken off
     */
    subtractSeven(date) {
      date.setDate(date.getDate() - 7);
      return date.toLocaleDateString()
    },
    /**
     * function that is called when a Graph option checkbox is ticked
     */
    checkboxChange() {
      //determine which checboxes are ticked
      this.chartData.datasets = [];
      if (this.selectedCheck.includes('temp')) {
        this.chartData.datasets.push(this.currentTempDataset);
      }
      if (this.selectedCheck.includes('egg')) {
        this.chartData.datasets.push(this.currentEggDataset);
      }
      if (this.selectedCheck.includes('light')) {
        this.chartData.datasets.push(this.currentLightDataset);
      }
    },
    /**
     * function that is called when a graph option datebox is selected
     */
    dateChange() {
      //Determine what data we want
      //API Call to grab shit between the two dates
      //Need to calculate correct range of data to put stuff in
      //set the datasets equal to it
    }
  },
}
</script>

<template>
  <div v-if="!isMobile()" class="TextChange">
    <b-modal id="startupModal" title="logIn">
      stuff
    </b-modal>
    <b-modal id="accountModal" title="Account Information">
      more stuff
    </b-modal>
    <b-modal id="notificationModal" title="Notifications">
      even more stuff
    </b-modal>
    <b-modal id="settingsModal" title="Settings">
      <p class="my-4">Hello from modal!</p>
    </b-modal>
    <b-sidebar id="graphSettingsSidebar" title="Graph Settings" shadow>
      <div class="px-3 py-2">
        <div style="align-items: center; text-align: center;">
          Date Range:
          <b-form-datepicker @input="dateChange" id="enter-datepicker" :placeholder="this.subtractSeven(new Date())"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" v-model="startDate" size="sm"
            style="font-size: 1.5vw;"></b-form-datepicker>
          To
          <b-form-datepicker @input="dateChange" id="enter-datepicker" :placeholder="new Date().toLocaleDateString()"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" v-model="endDate" size="sm"
            style="font-size: 1.5vw; margin-bottom: 5vh;"></b-form-datepicker>
          Display Information:
          <b-form-checkbox-group @input="checkboxChange" style="text-align: left ;" size="lg" id="graphOptions"
            v-model="selectedCheck" :options="options" stacked switches></b-form-checkbox-group>
        </div>
      </div>
    </b-sidebar>
    <div class="mainContainer">
      <b-card class="mainCard">
        <b-card class="topCard">
          <b-button-group style="float: right; position: relative;">
            <b-list-group horizontal="md" style="margin-right: 6vw;">
              <b-list-group-item style="font-size: 1.3vw; width: 22.5vw;">Currernt Temperature: {{ this.currentTemp
              }}&#x2109;</b-list-group-item>
              <b-list-group-item style="font-size: 1.3vw; width: 22.5vw">Currernt Light Level: {{ this.checkLight()
              }}</b-list-group-item>
            </b-list-group>
            <b-button v-b-modal.settingsModal variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="tools"></b-icon> Settings
            </b-button>
            <b-button v-b-modal.accountModal variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="person-fill"></b-icon> Account
            </b-button>
            <b-button v-b-modal.notificationModal variant="outline-primary" size="sm"
              style="width:10vw; font-size: 1.1vw">
              <b-icon icon="inbox-fill"></b-icon> Notifications
            </b-button>
          </b-button-group>
        </b-card>
        <b-card class="bottomCard">
          <div class="chart">
            <b-button v-b-toggle.graphSettingsSidebar>Graph Options</b-button>
            <LineChartGenerator :chart-options="chartOptions" :chart-data="chartData" />
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
.TextChange {
  font-family: "Verdana", Times, Sans-serif;
}

.mainContainer {
  min-height: 100vh;
  overflow-y: hidden;
  background-color: #fafafa !important;
}

.chart {
  float: left;
  width: 60%;
}

.coopCard {
  float: right;
  width: 38%;
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
  background-color: #fafafa !important;
}
</style>
