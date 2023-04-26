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
      isInit: false,
      isSignIn: false,
      button1Dis: true,
      button2Dis: false,
      coopCode: 123456,
      currentTemp: 0, //Current temperature of the given coop
      isCelc: true, //gives us current units C or F
      currentTempDataset: { //The current dataset needed for graph
        label: 'Temperature',
        data: [70, 68, 65, 75, 78, 76, 77],
        borderColor: '#ffa600',
        backgroundColor: '#003f5c',
      },
      currLight: true, //If the current level of light is adequate
      currentLightDataset: { //The current dataset needed for graph
        label: 'Humidity',
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
      text: null,
      isAdmin: false, //If user is an admin, if true, can access settings menu
      tempSliderValue: 65,
      lightSliderValue: 0,
      getRequestOptions: {
        method: 'GET',
        redirect: 'follow'
      },
      selectedCheck: ['temp', 'egg', 'humidity'], // Must be an array reference!
      selected: 1,
      DOW: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      options: [
        { text: '  Temperature', value: 'temp' },
        { text: '  Eggs', value: 'egg' },
        { text: '  Humidity', value: 'humidity' },
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
            label: 'Humidity',
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
        spanGaps: true,
      },
    }
  },
  /**
   * Runs of the load of the webpage
   */
  mounted() {
    this.$bvModal.show('startupModal')
  },
  created(){
    let that = this;
    let checkGauthLoad = setInterval(function () {
      that.isInit = that.$gAuth.isInit;
      that.isSignIn = that.$gAuth.isAuthorized;
      if (that.isInit) clearInterval(checkGauthLoad);
    }, 1000);
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
      if (this.currLight >= 1) {
        return "Adequate";
      }
      else {
        return "Too Low";
      }
    },
    /**
     * function that is called when a Graph option checkbox is ticked
     */
    updateGraph() {
      //First decide our timeframe
      //Then we check what data to include
      //Then fetch and display Data
      //determine which checboxes are ticked
      this.chartData.labels = [];
      //if we want to sort by the day
      if (this.selected == 1) {
        this.chartData.labels = ["12:00AM", "", "", "3:00AM", "", "", "6:00AM", "", "", "9:00AM", "", "", "12:00PM", "", "", "3:00PM", "", "", "6:00PM", "", "", "9:00PM", "", ""];
        // fetch("https://coop-final-project.glitch.me/api/box/1", this.getRequestOptions)
        //   .then(response => response.json()).then(value => this.sortByHour(value)).catch(error => console.log('error', error));
      }
      //If we want to sort by the week
      else if (this.selected == 2) {
        for (var i = 6; i >= 0; i--) {
          var Vardate = new Date();
          Vardate.setDate(Vardate.getDate() - i)
          this.chartData.labels.push([Vardate.toLocaleDateString("en-US", { weekday: 'long' })]);
        }
        //Grab data in between the week
        // fetch("https://coop-final-project.glitch.me/api/box/1", this.getRequestOptions)
        //   .then(response => response.json()).then(value => this.sortByDays(value)).catch(error => console.log('error', error));
      }
      //Else if we want to sort by the month
      else if (this.selected == 3) {
        3
        //Populate graph with monthly data points
        //let date = new Date()
        //Get what month it is and populate the chart with days 28-31
        // fetch("https://coop-final-project.glitch.me/api/box/1", this.getRequestOptions)
        //   .then(response => response.json()).then(value => this.sortByDays(value)).catch(error => console.log('error', error));
      }
    },
    /**
     * Sorts data by hour and then populates the dashboard graph
     * @param {JSON} json is the daily data we need to parse
     */
    sortByHour(json) {
      var weeklist;
      var weekval;
      var keyTemp;
      var key;
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[1].data = [];
      this.chartData.datasets[2].data = [];
      if (this.selectedCheck.includes('temp')) {
        weeklist = {}
        weekval = {}
        for (var i = 0; i < json.length; i++) {
          keyTemp = json[i]['date'].toString();
          //var dateT
          key = keyTemp.substring(0, 10); //CHANGE HERE TO PARSE TO HOUR INSTEAD OF Date
          if (key in weeklist) {
            weeklist[key] += 1;
            weekval[key] += json[i]['temperature'];
          }
          else {
            weeklist[key] = 1;
            weekval[key] = json[i]['temperature'];
          }
        }
      }
    },
    /**
     * Function that takes in json data and populates the graph accordingly
     * @param {JSON} json is our coop data for the week or month
     */
    sortByDays(json) {
      //Next check what data we want to Display
      var weeklist;
      var weekval;
      var keyTemp;
      var key;
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[1].data = [];
      this.chartData.datasets[2].data = [];
      if (this.selectedCheck.includes('temp')) {
        weeklist = {}
        weekval = {}
        for (var i = 0; i < json.length; i++) {
          //If there is a date in the dictionary
          keyTemp = json[i]['date'].toString();
          key = keyTemp.substring(0, 10);
          if (key in weeklist) {
            weeklist[key] += 1;
            weekval[key] += json[i]['temperature'];
          }
          else {
            weeklist[key] = 1;
            weekval[key] = json[i]['temperature'];
          }
          //this.chartData.labels += json[i]['date']
          // console.log(json[i]['temperature'])
          // this.chartData.datasets[0].data.push(json[i]['temperature'])
        }
        for (const key in weeklist) {
          //console.log("On Day " + key + "The average temperature was " + weekval[key] / weeklist[key])
          this.chartData.datasets[0].data.push(weekval[key] / weeklist[key])
        }
      }
      //If the egg slot is selected
      if (this.selectedCheck.includes('egg')) {
        weeklist = {}
        for (var k = 0; k < json.length; k++) {
          //If there is a date in the dictionary
          keyTemp = json[k]['date'].toString();
          //console.log(json[k])
          //console.log(json[j]['date'].toString())
          key = keyTemp.substring(0, 10);
          if (key in weeklist && json[k]['hasEgg']) {
            weeklist[key] += 1;
          }
          else if (json[k]['hasEgg']) {
            weeklist[key] = 1;
          }
        }
        for (const key in weeklist) {
          //console.log("On Day " + key + "The average temperature was " + weekval[key] / weeklist[key])
          this.chartData.datasets[1].data.push(weeklist[key])
        }
      }
      if (this.selectedCheck.includes('humidity')) {
        weeklist = {}
        weekval = {}
        for (var j = 0; j < json.length; j++) {
          //If there is a date in the dictionary
          keyTemp = json[j]['date'].toString();
          //console.log(json[j]['date'].toString())
          key = keyTemp.substring(0, 10);
          if (key in weeklist) {
            weeklist[key] += 1;
            weekval[key] += json[j]['humidity'];
          }
          else {
            weeklist[key] = 1;
            weekval[key] = json[j]['humidity'];
          }
          //this.chartData.labels += json[i]['date']
          // console.log(json[i]['temperature'])
          // this.chartData.datasets[0].data.push(json[i]['temperature'])
        }
        for (const key in weeklist) {
          //console.log("On Day " + key + "The average temperature was " + weekval[key] / weeklist[key])
          this.chartData.datasets[2].data.push(weekval[key] / weeklist[key])
        }
      }
    },
    /**
   * Test function that might reduce parsing time of the json file
   * test when internet is back
   * @param {JSON} json is our coop data for the week or month
   */
    TESTsortByDays(json) {
      //Next check what data we want to Display
      var weeklist = {};
      var weekval = {};
      var keyTemp;
      var key;
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[1].data = [];
      this.chartData.datasets[2].data = [];
      for (var i = 0; i < json.length; i++) {
        //If there is a date in the dictionary
        keyTemp = json[i]['date'].toString();
        key = keyTemp.substring(0, 10);
        if (key in weeklist) {
          weeklist[key] += 1;
          weekval[key]['temp'] += json[i]['temperature'];
          weekval[key]['humidity'] += json[i]['humidity'];
          if (json[i]['hasEgg']) {
            weekval[key]['egg'] += 1;
          }
        }
        else {
          weeklist[key] = 1;
          weekval[key] = json[i]['temperature'];
          weekval[key]['humidity'] = json[i]['humidity'];
          if (weekval[i]['hasEgg']) {
            weekval[key]['egg'] = 1;
          }
        }
      }
      for (const key in weeklist) {
        if (this.selectedCheck.includes('temp')) {
          this.chartData.datasets[0].data.push(weekval[key]['temp'] / weeklist[key]['temp'])
        }
        if (this.selectedCheck.includes('egg')) {
          this.chartData.datasets[1].data.push(weeklist[key]['egg'])
        }
        this.chartData.datasets[2].data.push(weekval[key]['humidity'] / weeklist[key]['humidity'])
      }
    },
    /**
     * Rounds the time to the nearest hour given a date input
     * @param {DateTime} date is the date we want to round to
     */
    roundToHour(date) {
      var p = 60 * 60 * 1000; // milliseconds in an hour
      return new Date(Math.round(date.getTime() / p) * p);
    },
    /**
     * Converts temperature units
     * @param {float} temp is the temperature value we want to convert
     */
    unitsConvert(temp) {
      let newVal = 0;
      //If current units is celcius, convert to F 
      if (this.isCelc) {
        this.isCelc = false;
        newVal = (temp * (9 / 5)) + 32;
      }
      //If current units is F, convert to celcius
      else {
        this.isCelc = true;
        newVal = (temp - 32) / (9 / 5)
      }
      return newVal;
    },
    /**
     * Sends the inputted temperature to the server
     */
    setTempThresh() {
      if (this.lightSliderValue == 0) {
        this.button1Dis = true;
        this.button2Dis = false;
      }
      else {
        this.button1Dis = false;
        this.button2Dis = true;
      }
    },
    lightSet() {
      // var myHeaders = new Headers();
      // myHeaders.append("Content-Type", "application/json");

      // var requestOptions = {
      //   method: 'GET',
      //   headers: myHeaders,
      //   redirect: 'follow'
      // };

      // fetch("https://coop-project-server.glitch.me/current", requestOptions)
      //   .then(response => response.text())
      //   .then(result => console.log(result))
      //   .catch(error => console.log('error', error));
      //if the lights are off
      if (this.button1Dis) {
        this.button1Dis = false;
        this.button2Dis = true;
        this.lightSliderValue = 100;
      }
      else {
        this.button1Dis = true;
        this.button2Dis = false;
        this.lightSliderValue = 0;
      }
    },
    async handleClickUpdateScope() {
      const option = new window.gapi.auth2.SigninOptionsBuilder();
      option.setScope("email https://www.googleapis.com/auth/drive.file");
      const googleUser = this.$gAuth.GoogleAuth.currentUser.get();
      try {
        await googleUser.grant(option);
        console.log("success");
      } catch (error) {
        console.error(error);
      }
    },
    handleClickLogin() {
      this.$gAuth
        .getAuthCode()
        .then((authCode) => {
          //on success
          console.log("authCode", authCode);
        })
        .catch((error) => {
          //on fail do something
          console.log(error)
        });
    },
    async handleClickSignIn() {
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        console.log("googleUser", googleUser);
        console.log("getId", googleUser.getId());
        console.log("getBasicProfile", googleUser.getBasicProfile());
        console.log("getAuthResponse", googleUser.getAuthResponse());
        console.log(
          "getAuthResponse",
          this.$gAuth.GoogleAuth.currentUser.get().getAuthResponse()
        );
        this.isSignIn = this.$gAuth.isAuthorized;
      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },
    async handleClickSignOut() {
      try {
        await this.$gAuth.signOut();
        this.isSignIn = this.$gAuth.isAuthorized;
        console.log("isSignIn", this.$gAuth.isAuthorized);
      } catch (error) {
        console.error(error);
      }
    },
    handleClickDisconnect() {
      window.location.href = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${window.location.href}`;
    },

  },
}
</script>

<template>
  <div v-if="!isMobile()" class="TextChange">
    <b-modal ref="startupModal" id="startupModal" title="Login" :hide-footer="true" size="lg">
      <b-form-input v-model="text" placeholder="Chicken ID" style="margin-top: 1vw; margin-bottom: 1vw;"></b-form-input>
      <b-form-input v-model="text" placeholder="Username" style="margin-bottom: 1vw"></b-form-input>
      <div class="hello">
        <div>
          <b-button type="primary" icon="fas fa-edit" @click="handleClickLogin" :disabled="!isInit">get
            authCode</b-button>
          <b-button type="primary" icon="fas fa-edit" @click="handleClickSignIn" v-if="!isSignIn"
            :disabled="!isInit">sign in</b-button>
          <b-button type="primary" icon="fas fa-edit" @click="handleClickSignOut" v-if="isSignIn"
            :disabled="!isInit">sign out</b-button>
          <b-button type="primary" icon="fas fa-edit" @click="handleClickDisconnect"
            :disabled="!isInit">disconnect</b-button>
          <i class="fas fa-edit"></i>
          <p>isInit: {{ isInit }}</p>
          <p>isSignIn: {{ isSignIn }}</p>

          <b-button type="primary" icon="fas fa-edit" @click="handleClickUpdateScope" :disabled="!isInit">update
            scope</b-button>
          </div>
      </div>
      <b-button>Set up</b-button>
    </b-modal>
    <b-modal id="accountModal" title="Account Information">
      more stuff
    </b-modal>
    <b-modal id="notificationModal" title="Notifications">
      even more stuff
    </b-modal>
    <b-modal id="settingsModal" hide-footer title="Settings">
      <div>
        <b style="text-align: center;">Light</b>
        <b-button v-on:click="lightSet" :disabled="button1Dis" variant="danger" size="md"
          style="margin-left: 5vw; min-width: 10vw; margin-right: 2.5vw;">Off</b-button>
        <b-button v-on:click="lightSet" :disabled="button2Dis" variant="success" size="md"
          style="min-width: 10vw;">On</b-button>
      </div>
      <div style="padding-top: 5vh;">
        <b>Set temperature threshold:</b>
        <input @mouseup="setTempThresh" style="margin-left: 2.5vw;" v-model="tempSliderValue" type="range" min="0"
          max="100" value="65" class="slider" />
        {{ this.tempSliderValue }}&#x2109;
      </div>
      <div style="padding-top: 5vh;">
        <b>Light Brightness:</b>
        <input @mouseup="setTempThresh" style="margin-left: 2.5vw;" v-model="lightSliderValue" type="range" min="0"
          max="100" value="65" class="slider" />
        {{ this.lightSliderValue }}%
      </div>

    </b-modal>
    <b-sidebar id="graphSettingsSidebar" title="Graph Settings" shadow>
      <div class="px-3 py-2">
        <div style="align-items: center; text-align: center;">
          Date Range:
          <b-form-group>
            <b-form-radio v-on:change="updateGraph" v-model="selected" name="some-radios" value="1">
              Day</b-form-radio>
            <b-form-radio v-on:change="updateGraph" v-model="selected" name="some-radios" value="2">
              Week</b-form-radio>
            <b-form-radio v-on:change="updateGraph" v-model="selected" name="some-radios" value="3">
              Month</b-form-radio>
          </b-form-group>
          Display Information:
          <b-form-checkbox-group change="updateGraph" style="text-align: left ;" size="lg" id="graphOptions"
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
            <b-card title="Box 1" tag="article" style="max-width: 20rem; margin-left: 3.5vw;" class="mb-2"></b-card>
            <b-card title="Box 2" tag="article" style="margin-top: 5vh; max-width: 20rem; margin-left: 3.5vw;"
              class="mb-2"></b-card>
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
