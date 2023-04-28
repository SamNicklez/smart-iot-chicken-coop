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
    LineChartGenerator,
  },
  /**
   * Data that is used in the program
   */
  data() {
    return {
      isInit: false, //If the user is in the sign in screen
      isSignIn: false, //If the user is signed in
      button1Dis: true, //Tells us if the lights are on or off 
      button2Dis: false, //Tells us if the lights are on or off
      email: "", //email of the user logged in
      name: "", //name of the user logged in
      coopCode: null, //coop code we need to connect to the correct coop
      isCelc: false, //gives us current units C or F
      /**
       * Dummy data for testing purposes while team builds out server components
       * There is a built in toggle in the settings menu to pull from the server
       */
      test: true,
      weeklyTempData: [51.7, 41.5, 35.1, 38.1, 43.5, 46.6, 35.6],
      weeklyHumidityData: [83.7, 70.7, 76.7, 58.1, 55.3, 59.4, 75.6],
      weeklyEggData: [12, 4, 8, 2, 8, 10, 1],
      dailyTempData: [44, 42, 40, 38, 38, 37, 38, 41, 45, 48, 50, 52, 54, 55, 55, 56, 56, 55, 52, 49, 46, 43, 42, 39],
      dailyHumidityData: [63, 70, 77, 83, 83, 86, 83, 79, 71, 66, 61, 54, 47, 42, 40, 37, 37, 37, 40, 44, 50, 56, 55, 65],
      dailyEggData: [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      monthlyEggData: [3, 5, 8, 6, 9, 10, 8, 6, 8, 2, 3, 12, 6, 12, 3, 12, 8, 11, 2, 3, 10, 11, 5, 12, 4, 8, 2, 8, 10, 1],
      monthlyTempData: [37.4, 36.7, 33.7, 48.0, 57.4, 37.1, 48.0, 48.8, 52.0, 44.8, 36.7, 46.6, 53.2, 56.5, 57.8, 63.5, 69.33, 66.3, 68.0, 53.8, 35.4, 41.4, 46.2, 54.2, 51.7, 41.5, 35.1, 38.1, 43.5, 46.6, 35.6],
      monthlyHumidityData: [56.7, 47.9, 53.4, 76.0, 71.1, 56.6, 52.7, 87.1, 79.6, 52.5, 44.8, 36.3, 34.3, 46.4, 50.0, 43.8, 44.0, 39.1, 74.0, 78.8, 66.8, 55.5, 60.2, 83.7, 70.7, 76.7, 58.1, 55.3, 59.4, 75.6],
      //End dummy data

      currentLight: "N/A", //If the current level of light is adequate
      currentTemp: 0, //Current temperature of the given coop
      currentHum: 0, //Current humidity
      box1HasChicken: false, //If box 1 currently has a chicken in it
      box2HasChicken: false, //If box 2 currently has a chicken in it
      box1Eggs: 0, // how many eggs box 1 has
      box2Eggs: 0, // how many eggs box 2 has
      text: null, //Current text of the checkboxes
      isAdmin: false, //If user is an admin, if true, can access settings menu
      tempSliderUpperValue: 65, //Upper temp value set by user
      tempSliderLowerValue: 30, //Lower temp value set by user
      autoLight: false, //if true, user does not control the light settings
      lightSliderValue: 0, //Light % value set by user
      selectedCheck: ['temp', 'egg', 'humidity'], //tells us what to display on the graph
      selected: 1,
      DOW: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      options: [
        { text: '  Temperature', value: 'temp' },
        { text: '  Eggs', value: 'egg' },
        { text: '  Humidity', value: 'humidity' },
      ],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Temperature',
            data: [44, 42, 40, 38, 38, 37, 38, 41, 45, 48, 50, 52, 54, 55, 55, 56, 56, 55, 52, 49, 46, 43, 42, 39],
            borderColor: '#ffa600',
            backgroundColor: '#003f5c',
          },
          {
            label: 'Eggs',
            data: [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            borderColor: '#a05195',
            backgroundColor: '#d45087',
          },
          {
            label: 'Humidity',
            data: [63, 70, 77, 83, 83, 86, 83, 79, 71, 66, 61, 54, 47, 42, 40, 37, 37, 37, 40, 44, 50, 56, 55, 65],
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
  /**
   * Runs on the creation of the webpage
   */
  created() {
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
    checkLight(light) {
      if (light == 1) {
        return "Good";
      }
      else {
        return "Low";
      }
    },
    /**
     * function that is called when a Graph option checkbox is ticked
     */
    updateGraph() {
      var Vardate;
      //First decide our timeframe
      //Then we check what data to include
      //Then fetch and display Data
      //determine which checboxes are ticked
      this.chartData.labels = [];
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[1].data = [];
      this.chartData.datasets[2].data = [];
      //if we want to sort by the day
      if (this.test) {
        if (this.selected == 1) {
          Vardate = new Date();
          var hour = Vardate.getHours();
          for (var z = 23; z >= 0; z--) {
            if (z % 2 == 0) {
              this.chartData.labels.push("");
            }
            else {
              if (hour == 0) {
                hour = 24;
              }
              if (hour > 12) {
                var editHour = hour - 12;
                this.chartData.labels.push(editHour + ":00PM");
              }
              else {
                this.chartData.labels.push(hour + ":00AM");
              }
            }
            hour--;
          }
          this.chartData.labels.reverse();
          if (this.selectedCheck.includes('temp')) {
            this.chartData.datasets[0].data = this.dailyTempData;
          }
          if (this.selectedCheck.includes('egg')) {
            this.chartData.datasets[1].data = this.dailyEggData;
          }
          if (this.selectedCheck.includes('humidity')) {
            this.chartData.datasets[2].data = this.dailyHumidityData;
          }
        }
        //If we want to sort by the week
        else if (this.selected == 2) {
          for (var i = 6; i >= 0; i--) {
            Vardate = new Date();
            Vardate.setDate(Vardate.getDate() - i)
            this.chartData.labels.push([Vardate.toLocaleDateString("en-US", { weekday: 'long' })]);
          }
          if (this.selectedCheck.includes('temp')) {
            this.chartData.datasets[0].data = this.weeklyTempData;
          }
          if (this.selectedCheck.includes('egg')) {
            this.chartData.datasets[1].data = this.weeklyEggData;
          }
          if (this.selectedCheck.includes('humidity')) {
            this.chartData.datasets[2].data = this.weeklyHumidityData;
          }
        }
        //Else if we want to sort by the month
        else if (this.selected == 3) {
          for (var j = 29; j >= 0; j--) {
            Vardate = new Date();
            Vardate.setDate(Vardate.getDate() - j)
            if (j % 2 == 0) {
              this.chartData.labels.push("")
            }
            else {
              this.chartData.labels.push([Vardate.toLocaleDateString("en-US")]);
            }
          }
          if (this.selectedCheck.includes('temp')) {
            this.chartData.datasets[0].data = this.monthlyTempData;
          }
          if (this.selectedCheck.includes('egg')) {
            this.chartData.datasets[1].data = this.monthlyEggData;
          }
          if (this.selectedCheck.includes('humidity')) {
            this.chartData.datasets[2].data = this.monthlyHumidityData;
          }
        }
      }
      //If not in test mode, pull from the server
      else {
        if (this.selected == 1) {
          this.getDay();
        }
        //If we want to sort by the week
        else if (this.selected == 2) {
          this.getWeek()
        }
        //Else if we want to sort by the month
        else if (this.selected == 3) {
          this.getMonth()
        }
      }
    },
    /**
     * Converts F to C
     * @param {float} temp is the temperature value we want to convert
     */
    FtoC(temp) {
      let newVal = 0;
      newVal = (temp - 32) / (9 / 5)
      return newVal;
    },
    /**
     * Converts C to F
     * @param {float} temp is the temperature in C we want to convert
     */
    CtoF(temp) {
      let newVal = 0;
      newVal = (temp * (9 / 5)) + 32;
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
      this.postSettings();
    },
    /**
     * Function that is called when the light button or light slider is used
     */
    lightSet() {
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
      this.postSettings();
    },
    /**
     * Function that populates the table with daily data from the server
     * @param {json} json is all of our daily data to populate the server
     */
    sortDay(json) {
      console.log(json)
      this.chartData.labels.reverse();
      var max = -100;
      var tempArray = [];
      var humArray = [];
      var eggArray = [];
      for (const key of Object.entries(json["temperature"])) {
        if (key[0] > max) {
          max = key[0];
        }
      }
      for (var x = 0; x < 24; x++) {
        tempArray.push(this.CtoF(json['temperature'][max]));
        humArray.push(json['humidity'][max]);
        eggArray.push(json['box1_eggs'][max] + json['box2_eggs'][max]);
        max--;
      }
      if (this.selectedCheck.includes('temp')) {
        this.chartData.datasets[0].data = tempArray;
      }
      if (this.selectedCheck.includes('egg')) {
        this.chartData.datasets[1].data = eggArray;
      }
      if (this.selectedCheck.includes('humidity')) {
        this.chartData.datasets[2].data = humArray;
      }
    },
    /**
     * Sorts monthly server side data and displays it on the graph
     * @param {json} json contains the month data
     */
    sortMonth(json) {
      for (var l = 29; l >= 0; l--) {
        var Vardate = new Date();
        Vardate.setDate(Vardate.getDate() - l)
        this.chartData.labels.push([Vardate.toLocaleDateString("en-US")]);
      }
      var max = -100;
      var tempArray = [];
      var humArray = [];
      var eggArray = [];
      for (const key of Object.entries(json["temperature"])) {
        if (key[0] > max) {
          max = key[0];
        }
      }
      for (var x = 0; x < 30; x++) {
        tempArray.push(this.CtoF(json['temperature'][max]));
        humArray.push(json['humidity'][max]);
        eggArray.push(json['box1_eggs'][max] + json['box2_eggs'][max]);
        max--;
      }
      if (this.selectedCheck.includes('temp')) {
        this.chartData.datasets[0].data = tempArray;
      }
      if (this.selectedCheck.includes('egg')) {
        this.chartData.datasets[1].data = eggArray;
      }
      if (this.selectedCheck.includes('humidity')) {
        this.chartData.datasets[2].data = humArray;
      }
    },
    /**
     * Sorts weekly server side data and displays it on the graph
     * @param {json} json contains the week data
     */
    sortWeek(json) {
      for (var i = 6; i >= 0; i--) {
        var Vardate = new Date();
        Vardate.setDate(Vardate.getDate() - i)
        this.chartData.labels.push([Vardate.toLocaleDateString("en-US", { weekday: 'long' })]);
      }
      var max = -100;
      var tempArray = [];
      var humArray = [];
      var eggArray = [];
      for (const key of Object.entries(json["temperature"])) {
        if (key[0] > max) {
          max = key[0];
        }
      }
      for (var x = 0; x < 7; x++) {
        tempArray.push(this.CtoF(json['temperature'][max]));
        humArray.push(json['humidity'][max]);
        eggArray.push(json['box1_eggs'][max] + json['box2_eggs'][max]);
        max--;
      }
      if (this.selectedCheck.includes('temp')) {
        this.chartData.datasets[0].data = tempArray;
      }
      if (this.selectedCheck.includes('egg')) {
        this.chartData.datasets[1].data = eggArray;
      }
      if (this.selectedCheck.includes('humidity')) {
        this.chartData.datasets[2].data = humArray;
      }
    },
    /**
     * Function that isn't currently used but would be used to update the token for further use
     */
    async handleClickUpdateScope() {
      const option = new window.gapi.auth2.SigninOptionsBuilder();
      option.setScope("email https://www.googleapis.com/auth/drive.file");
      const googleUser = this.$gAuth.GoogleAuth.currentUser.get();
      try {
        await googleUser.grant(option);
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Handles the button press of the login process for google oauth
     */
    handleClickLogin() {
      this.$gAuth
        .getAuthCode()
        .then((authCode) => {
          //on success
          return authCode;
        })
        .catch((error) => {
          //on fail do something
          console.log(error)
        });
    },
    /**
     * Handles the click sign-in process for google OAuth
     */
    async handleClickSignIn() {
      if (this.coopCode == 123456) {
        try {
          const googleUser = await this.$gAuth.signIn();
          if (!googleUser) {
            return null;
          }
          // console.log("Email", googleUser.getBasicProfile()['iw']);
          // console.log("Name", googleUser.getBasicProfile()['ZZ']);
          this.email = googleUser.getBasicProfile()['iw']
          this.name = googleUser.getBasicProfile()['ZZ']
          this.isSignIn = this.$gAuth.isAuthorized;
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          myHeaders.append("authorization", "123456");


          var raw = JSON.stringify({
            "coop_code": 123456,
            "email": googleUser.getBasicProfile()['iw'],
            "name": googleUser.getBasicProfile()['ZZ']
          });
          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };

          fetch("https://coop-project-server.glitch.me/login", requestOptions)
            .then(response => this.handleRESPONSE(response.status))
            .catch(error => console.log('error', error));
          this.$bvModal.hide('startupModal')
        } catch (error) {
          //on fail do something
          console.error(error);
          return null;
        }
      }
      else {
        window.alert("Incorrect Coop Code");
      }
    },
    /**
     * Function that sends the auth token to the server and checks if they are valid
     * If they are, grab data and set it to the graph
     * @param {HTTP Response} response contains if the user is valid or not
     */
    handleRESPONSE(response) {
      if (response == 200) {
        this.getSettings();
        setInterval(this.getCurrent, 10000)
        //Populate with 24 hour data from server if not in test mode
        if (!this.test) {
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          myHeaders.append("authorization", "123456");
          var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
          };
          fetch("https://coop-project-server.glitch.me/graph?interval=Day", requestOptions)
            .then(response => response.json())
            .then(result => this.sortDay(result))
            .catch(error => console.log('error', error));
        }
        else {
          var Vardate = new Date();
          var hour = Vardate.getHours();
          for (var z = 23; z >= 0; z--) {
            if (z % 2 == 0) {
              this.chartData.labels.push("");
            }
            else {
              if (hour == 0) {
                hour = 24;
              }
              if (hour > 12) {
                var editHour = hour - 12;
                this.chartData.labels.push(editHour + ":00PM");
              }
              else {
                this.chartData.labels.push(hour + ":00AM");
              }
              hour--;
            }
          }
          this.chartData.labels.reverse();
        }
      }
    },
    /**
     * Handles the button click of signing out of a google auth account
     */
    async handleClickSignOut() {
      try {
        await this.$gAuth.signOut();
        this.isSignIn = this.$gAuth.isAuthorized;
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Handles the disconnect of a google oauth account
     */
    handleClickDisconnect() {
      window.location.href = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${window.location.href}`;
    },
    /**
     * Grabs the current settings from the server
     */
    getSettings() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      fetch("https://coop-project-server.glitch.me/settings", requestOptions)
        .then(response => response.json()).then(response => this.setSettings(response))
        .catch(error => console.log('error', error));
    },
    /**
     * Helper function that sets local variables equal to the server settings
     * @param {json} json contains the current settings for the light and temperature
     */
    setSettings(json) {
      this.lightSliderValue = Math.round(json['brightness'])
      this.tempSliderUpperValue = Math.round(this.CtoF(json['tempMax']));
      this.tempSliderLowerValue = Math.round(this.CtoF(json['tempMin']));
      this.autoLight = json['autoLight']
    },
    /**
     * Sends the current user settings to the server
     */
    postSettings() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");
      var raw = JSON.stringify({
        "brightness": this.lightSliderValue,
        "tempMax": this.FtoC(this.tempSliderUpperValue),
        "tempMin": this.FtoC(this.tempSliderLowerValue),
        "autoLight": this.autoLight
      });
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      fetch("https://coop-project-server.glitch.me/settings", requestOptions)
        .catch(error => console.log('error', error));
    },
    /**
     * Grabs the current days data and displays it on the graph
     */
    getDay() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      fetch("https://coop-project-server.glitch.me/graph?interval=Day", requestOptions)
        .then(response => response.json())
        .then(result => this.sortDay(result))
        .catch(error => console.log('error', error));
    },
    /**
     * Grabs the current months data and displays it on the graph
     */
    getMonth() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch("https://coop-project-server.glitch.me/graph?interval=Month", requestOptions)
        .then(response => response.json())
        .then(result => this.sortMonth(result))
        .catch(error => console.log('error', error));
    },
    /**
     * Grabs the current weeks data and displays it on the graph
     */
    getWeek() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch("https://coop-project-server.glitch.me/graph?interval=Week", requestOptions)
        .then(response => response.json())
        .then(result => this.sortWeek(result))
        .catch(error => console.log('error', error));
    },
    /**
     * Function that grabs the current chicken data (temp, humidity, etc) and displays it
     */
    getCurrent() {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authorization", "123456");

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch("https://coop-project-server.glitch.me/current?coop_id=1", requestOptions)
        .then(response => response.json())
        .then(result => this.setCurrent(result))
        .catch(error => console.log('error', error));
    },
    /**
     * helper function that sets all the pulled current values and puts them on the screen
     * @param {json} json is our current chicken data
     */
    setCurrent(json) {
      //console.log(json)
      this.currentTemp = Math.round(this.CtoF(json['temp']))
      this.currentHum = Math.round(json['humidity'])
      this.currentLight = this.checkLight(json['light'])
      this.box1Eggs = json['numberOfEggs1']
      this.box2Eggs = json['numberOfEggs2']
      this.box1HasChicken = this.checkChicken(json['hasChicken1'])
      this.box2HasChicken = this.checkChicken(json['hasChicken2'])
    },
    /**
     * Function that takes in a number and returns a string which corresponds to the correct
     * action
     * @param {0 | 1} value 
     */
    checkChicken(value) {
      if (value == 0) {
        return "No active chicken in box"
      }
      else {
        return "Chicken in box"
      }
    },
  },
}
</script>

<template>
  <div v-if="!isMobile()" class="TextChange">
    <b-modal ref="startupModal" id="startupModal" title="Login" :hide-footer="true" size="md" no-close-on-esc
      no-close-on-backdrop hide-header-close>
      <b-form-input v-model="coopCode" placeholder="Chicken ID"
        style="margin-top: 1vw; margin-bottom: 1vw; -webkit-text-security: square;" maxlength="6"></b-form-input>
      <div class="OAuth" style="margin: 0 auto;">
        <div>
          <b-button type="primary" icon="fas fa-edit" @click="handleClickSignIn" :disabled="!isInit">Sign
            In</b-button>
        </div>
      </div>
    </b-modal>
    <b-modal id="accountModal" title="Account Information">
      <table>
        <tr>
          <b>Email: </b> {{ this.email }}
        </tr>
        <tr>
          <b>Name: </b> {{ this.name }}
        </tr>
      </table>
      <b-button type="primary" style="margin-top: 2.5vh;" icon="fas fa-edit" @click="handleClickDisconnect"
        :disabled="!isInit">Log Out</b-button>
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
        <b>Set upper temperature threshold:</b>
        <input @mouseup="setTempThresh" style="margin-left: 2.5vw;" v-model="tempSliderUpperValue" type="range" min="0"
          max="100" value="65" class="slider" />
        {{ this.tempSliderUpperValue }}&#x2109;
        <b> Set lower temperature threshold: </b>
        <input @mouseup="setTempThresh" style="margin-left: 2.5vw;" v-model="tempSliderLowerValue" type="range" min="0"
          max="100" value="65" class="slider" />
        {{ this.tempSliderLowerValue }}&#x2109;
      </div>
      <div style="padding-top: 5vh;">
        <b>Light Brightness:</b>
        <input @mouseup="setTempThresh" style="margin-left: 2.5vw;" v-model="lightSliderValue" type="range" min="0"
          max="100" value="65" class="slider" />
        {{ this.lightSliderValue }}%
        <b-form-checkbox id="checkbox-1" v-model="test" name="checkbox-1" :value="true" :unchecked-value="false">
          Use Testing Data
        </b-form-checkbox>
        <b-form-checkbox v-on:change="postSettings" id="checkbox-2" v-model="autoLight" name="checkbox-2" :value="1" :unchecked-value="0">
          Auto light
        </b-form-checkbox>
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
          <b-form-checkbox-group v-on:change="updateGraph" style="text-align: left ;" size="lg" id="graphOptions"
            v-model="selectedCheck" :options="options" stacked switches></b-form-checkbox-group>
        </div>
      </div>
    </b-sidebar>
    <div class="mainContainer">
      <b-card class="mainCard">
        <b-card class="topCard">
          <b-button-group style="float: right; position: relative;">
            <b-list-group horizontal="md" style="margin-right: 2vw;">
              <b-list-group-item style="font-size: 1.3vw; width: 22.5vw;">Current Temperature: {{ this.currentTemp
              }}&#x2109;</b-list-group-item>
              <b-list-group-item style="font-size: 1.3vw; width: 22.5vw">Currernt Light Level: {{ this.currentLight
              }}</b-list-group-item>
              <b-list-group-item style="font-size: 1.3vw; width: 22.5vw">Currernt Humidity: {{ this.currentHum
              }}%</b-list-group-item>
            </b-list-group>
            <b-button v-b-modal.settingsModal variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="tools"></b-icon> Settings
            </b-button>
            <b-button v-b-modal.accountModal variant="outline-primary" size="sm" style="width:10vw; font-size: 1.1vw">
              <b-icon icon="person-fill"></b-icon> Account
            </b-button>
          </b-button-group>
        </b-card>
        <b-card class="bottomCard">
          <div class="chart">
            <b-button v-b-toggle.graphSettingsSidebar>Graph Options</b-button>
            <LineChartGenerator :chart-options="chartOptions" :chart-data="chartData" />
          </div>
          <b-card class="coopCard" header="Coop View">
            <b-card title="Box 1" tag="article" style="max-width: 20rem; margin-left: 3.5vw;" class="mb-2">
              <table>
                <tr>
                  <b>Eggs in box: </b> {{ this.box1Eggs }}
                </tr>
                <tr>
                  <b>{{ this.box1HasChicken }}</b>
                </tr>
              </table>
            </b-card>
            <b-card title="Box 2" tag="article" style="margin-top: 5vh; max-width: 20rem; margin-left: 3.5vw;"
              class="mb-2">
              <table>
                <tr>
                  <b>Eggs in box: </b> {{ this.box2Eggs }}
                </tr>
                <tr>
                  <b>{{ this.box2HasChicken }}</b>
                </tr>
              </table>
            </b-card>
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