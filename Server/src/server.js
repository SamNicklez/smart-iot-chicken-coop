const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const cors = require("cors");
const http = require("http");
const nodemailer = require("nodemailer");
const emailjs = require("@emailjs/browser");

const model = require("./model.js");
const apis = require("./databaseAPIs.js");
const express = require("express");
const app = express();
var socketIO = require("socket.io");
const fs = require("fs");
const path = require("path");

emailjs.init("6l0xOLiYUEeohdIdl");
var email_next_send = new Date();

const server = http.createServer(app);

const API_URL = "https://coop-project-api.glitch.me/";

async function isAuth(req, res, next) {
  const auth = await req.headers.authorization;
  if (auth === "123456") {
    next();
  } else {
    res.status(401);
    res.send("Access forbidden");
  }
}

// initialize variables
var num_Coops = 0;
let coops = new Map();
const enteredTimes = [];
const chickenPresent = [];
var connect = false;
var lastSentTemp = [-100, -100];
var lastSentHumid = [-100, -100];
var lastSentLight = [-1, -1];
var lastSentPrediction = "Starter";

// allowed connections (PI)
const ALLOWEDCONNECTIONS = [8753025873489];

// listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on Port: " + listener.address().port);
});

app.use(express.json());
app.use(cors());

let io = socketIO(listener);

io.on("connection", async function (socket) {
  // checking the clients authentication ID
  console.log("\nSocketID: ", socket.handshake.query.AuthID);
  const token = await socket.handshake.query.AuthID;
  const intToken = parseInt(token);
  if (!token) {
    console.log(
      "Client did not have authentication token. Connection rejected"
    );
    socket.disconnect();
    connect = false;
  }
  // Check if ID is allowed
  else if (!ALLOWEDCONNECTIONS.includes(intToken)) {
    console.log("Client ID not allowed. Connection rejected");
    socket.disconnect();
  } else {
    // Allow the connection
    console.log("User with AuthID: ", token, " allowed to connect");
    connect = true;
  }

  console.log("New Connection! SocketID: ", socket.id);

  socket.on("PI_COOP_DATA", async function (data) {
    // Log the received values
    console.log(
      "\nDATA RECEIVED FROM PI:\n\t| CoopID:",
      data.coopID,
      "\t      | BoxID:",
      data.boxID,
      "\t | NumberOfBoxes:",
      data.numBoxes,
      "|",
      "\n\t| Temperature:",
      data.temperature,
      " | Humidity:",
      data.humidity,
      " | Light:",
      data.light,
      "\t    |"
    );

    // Set the received values to corresponding properties
    const { coopID, boxID, numBoxes, temperature, humidity, light, image } =
      data;

    // add it to the map of coops if its not already in there
    if (!coops.has(coopID)) {
      await addCoop(1, data.numBoxes);
    } else {
      const currentCoop = await coops.get(coopID);
      const currentBox = await currentCoop.boxes[boxID - 1];

      // set the coops current data values
      currentCoop.temp = temperature;
      currentCoop.humidity = humidity;
      currentCoop.light = light;

      // get the last prediction for this box
      lastSentPrediction = currentCoop.boxes[boxID - 1].prediction;

      // call the model to get a new prediction
      currentCoop.boxes[boxID - 1].prediction = await runModel(
        image,
        currentBox,
        currentCoop.ID
      );

      // Checks to see any of the read in values are significantly different than what's stored in the database if they are then make a new database entry
      if (
        Math.abs(lastSentTemp - temperature) > 1 ||
        Math.abs(lastSentHumid - humidity) > 1 ||
        Math.abs(lastSentLight - light) > 0 ||
        !(
          JSON.stringify(lastSentPrediction) ===
          JSON.stringify(currentCoop.boxes[boxID - 1].prediction)
        )
      ) {
        // update the database
        apis.postBoxData(
          boxID,
          currentCoop.boxes[boxID - 1].numberOfEggs,
          temperature,
          light,
          humidity
        );
        // keep track of last sent values so we know when new ones are different
        lastSentLight[boxID - 1] = light;
        lastSentHumid[boxID - 1] = humidity;
        lastSentTemp[boxID - 1] = temperature;
        lastSentPrediction[boxID - 1] = currentCoop.boxes[boxID - 1].prediction;
      }
    }
  });

  /*
  runModel takes in an image, box, and coop ID. It runs the prediction model on the image and updates the input
  box and coop's data to reflect its prediction. Based on the prediction the pi is sent cooresponding data to
  change the lights.
  */
  async function runModel(image, box, coopID) {
    const predictions = await model.predict(image);

    const category = predictions[0]["class"];
    const confidence = predictions[0]["score"];
    console.log(
      "\nRUNNING PREDICTION MODEL:\n\t| BoxID:",
      box.ID,
      "\t\t   | Old Prediction: ",
      box.prediction,
      "|",
      "\n\t| New Prediction:",
      category,
      " | Confidence: ",
      confidence,
      "|"
    );

    // Make sure that confidence is an integer
    const confidenceInt = parseFloat(confidence);
    // only considering a confidence of 75>= to be accurate
    var leastConfidentWeTake = 0.75;

    if (confidenceInt >= leastConfidentWeTake) {
      // check the model's predictions and call the correct APIs based on the new prediction
      if (category == "Chicken" && box.prediction != "Chicken") {
        apis.chickenEntered(box.ID, coopID);
        box.enterDate = new Date().toISOString();
        box.hasChicken = true;
        console.log("\nCHICKEN ENTERED:", box.ID);
      } else if (category != "Chicken" && box.prediction == "Chicken") {
        if (box.enterDate != -1) {
          console.log("\nCHICKEN EXITED:", box.ID);
          apis.chickenExited(box.enterDate);
          box.hasChicken = 0;
        } else {
          console.log("ERROR: Chicken exit called before chicken entered.");
        }
        box.enterDate = -1;
      } else if (category == "No Egg") {
        box.numberOfEggs = 0;
        socket.emit("UPDATE_GREEN", { brightness: 0, box: box.ID });
      } else if (category == "1Egg") {
        sendEmail();
        box.numberOfEggs = 1;
        socket.emit("UPDATE_GREEN", { brightness: 1, box: box.ID });
      } else if (category == "2Egg") {
        sendEmail();
        box.numberOfEggs = 2;
        socket.emit("UPDATE_GREEN", { brightness: 1, box: box.ID });
      } else if (category == "3Egg") {
        sendEmail();
        box.numberOfEggs = 3;
        socket.emit("UPDATE_GREEN", { brightness: 1, box: box.ID });
      }
      box.prediction = category;
      return category;
    }
    return box.prediction;
  }

  // update_lights takes in settings relating to coops lighting and sends them to pi
  function update_lights(autoLight, brightness, tempMax, tempMin) {
    socket.emit("LIGHT_MODE", autoLight);
    socket.emit("UPDATE_WHITE", brightness);
    var data = {
      tempMax: tempMax,
      tempMin: tempMin,
    };
    socket.emit("UPDATE_TEMP_SETTINGS", data);
  }

  // api for web app to be able to request a settings change in database
  app.post("/settings", isAuth, (req, res) => {
    (async () => {
      try {
        await fetch(API_URL + "api/settings", {
          method: "PATCH",
          body: JSON.stringify({
            autoLight: req.body.autoLight,
            brightness: parseInt(req.body.brightness),
            tempMax: req.body.tempMax,
            tempMin: req.body.tempMin,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: "123456",
          },
        });
        update_lights(
          req.body.autoLight,
          req.body.brightness,
          req.body.tempMax,
          req.body.tempMin
        );
        return res.status(200).send();
      } catch (error) {
        return res.status(500).send(error);
      }
    })();
  });

  // api for web app to be able to request the current settings from the database
  app.get("/settings", isAuth, (req, res) => {
    (async () => {
      try {
        const response = await fetch(API_URL + "api/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "123456",
          },
        });
        const json = await response.json();
        return res.status(200).send(json);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  });
});

/*
Coop class houses:
  * ID: a unique id
  * boxes: list of Box objects in coop
  * temp: current temperature
  * humidity: current humidity
  * light(1 or 0): whether or not the coops arduino is exposed to enough light
*/
class Coop {
  constructor(ID, boxes, temp, humidity, light) {
    this.ID = ID;
    this.boxes = boxes;
    this.temp = temp;
    this.humidity = humidity;
    this.light = light;
  }
}

/*
Box class houses:
  * ID: a unique id
  * prediction: the current prediction made by the model
  * numberOfEggs: number of eggs model predicted (this is seperate from prediction because if a chicken is currently predicted eggs can still be in the box)
  * hasChicken: if chicken is predicted by model
  * enterDate: when a chicken enters the box the enter date is kept for logging both enter and exit times
*/
class Box {
  constructor(ID, prediction, numberOfEggs, hasChicken, chickenEnterDate) {
    this.ID = ID;
    this.prediction = prediction;
    this.numberOfEggs = numberOfEggs;
    this.hasChicken = hasChicken;
    this.enterDate = chickenEnterDate;
  }
}

// addCoop takes in a coop ID and some number of boxes and makes a Coop object.
// Box objects are also made and place inside the Coop object.
async function addCoop(ID, numBoxes) {
  console.log("\nUnrecognized Coop!");

  var newCoop = new Coop(ID, []);

  for (var i = 0; i < numBoxes; i++) {
    newCoop.boxes[i] = new Box(i + 1, "No Egg", 0, 0);
  }
  num_Coops++;

  coops.set(ID, newCoop);
  console.log("\nCoop Created:\n\tID:", ID, "\n\tNumber of Boxes:", numBoxes);
}

// api for web app to be able validate an input coop code and add the user to the database
// if the code is valid
app.post("/login", isAuth, (req, res) => {
  (async () => {
    try {
      const validCode = await checkCode(req.body.coop_code);
      if (validCode == false) {
        return res.status(404).send("Invalid Coop Code");
      } else {
        addUser(req.body.name, req.body.email);
        return res.status(200).send();
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Pi is not running");
    }
  })();
});

// checkCode takes in an input code and makes a GET request to get the valid coop code from
// the database. It then checks to see if the input code is valid and returns a bool
async function checkCode(coop_code) {
  const resp = await fetch(API_URL + "api/users/1", {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization: "123456" },
  });
  const json = await resp.json();
  return json["coop_code"] == coop_code;
}

// addUser takes a name and email and performs a POST request to add them to the database
async function addUser(name, email) {
  fetch(API_URL + "api/users", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      name: name,
    }),
    headers: { "Content-Type": "application/json", authorization: "123456" },
  });
}

// api for web app to be able to request the current status of the coop
app.get("/current", isAuth, (req, res) => {
  (async () => {
    try {
      const response = await currentData(req.query.coop_id);
      if (response == -1) {
        return res.status(500).send("Pi is not running");
      } else {
        return res.status(200).send(response);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Pi is not running");
    }
  })();
});

// currentData grabs the coops current data and returns it
async function currentData(coopID) {
  try {
    var currentCoop = coops.get(parseInt(coopID));

    const numberOfEggs = [];
    const hasChicken = [];

    for (var i = 0; i < currentCoop.boxes.length; i++) {
      numberOfEggs[i] = currentCoop.boxes[i].numberOfEggs;
      hasChicken[i] = currentCoop.boxes[i].hasChicken;
    }

    const returnData = {
      temp: currentCoop.temp,
      humidity: currentCoop.humidity,
      light: currentCoop.light,
      numberOfEggs1: numberOfEggs[0],
      numberOfEggs2: numberOfEggs[1],
      hasChicken1: hasChicken[0],
      hasChicken2: hasChicken[1],
    };

    return returnData;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

// api for web app to be able to request data to populate its graph
app.get("/graph", isAuth, (req, res) => {
  (async () => {
    try {
      const response = await graphData(req.query.coop_id, req.query.interval);
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

//graphData takes in a coop ID and a string refering to the range of data the web app is requesting.
async function graphData(coopID, interval) {
  if (interval == "Day") {
    /*
    If the interval is 'Day' we grab data from the database using apis between the current date and
    24 hours earlier. The data includes temperature, humidity, and number of eggs. We split the data
    up by hours and then for each hour we calculate the average for temperature and humidity. For
    number of eggs we take the sum. We take the average and sum of all boxes in the given coop and
    return it to the web app to be graphed.
    */

    const start_date = new Date();
    start_date.setHours(start_date.getHours() + 1);
    start_date.setMinutes(0);
    start_date.setSeconds(0);
    start_date.setMilliseconds(0);
    var end_date = new Date(start_date);
    end_date.setDate(start_date.getDate() - 1);

    var i, j, k;
    var temp_dict = {};
    var hum_dict = {};
    var box1_eggs_dict = {};
    var box2_eggs_dict = {};

    for (i = 0; i < 24; i++) {
      temp_dict[start_date.getHours() - i - 1] = [];
      hum_dict[start_date.getHours() - i - 1] = [];
      box1_eggs_dict[start_date.getHours() - i - 1] = [];
      box2_eggs_dict[start_date.getHours() - i - 1] = [];
    }

    const response1 = await fetch(
      API_URL +
        "api/box/1/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json1 = await response1.json();

    var temp_date;
    for (i = 0; i < json1.length; i++) {
      const current_date = new Date(json1[i]["date"]);
      for (j = 0; j < 24; j++) {
        temp_date = decrementHours(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getHours() - j].push(
            parseFloat(json1[i]["temperature"])
          );
          hum_dict[start_date.getHours() - j].push(
            parseFloat(json1[i]["humidity"])
          );
          box1_eggs_dict[start_date.getHours() - j].unshift(
            parseInt(json1[i]["numberOfEggs"])
          );
          j = 24;
        }
      }
    }

    const response2 = await fetch(
      API_URL +
        "api/box/2/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json2 = await response2.json();

    for (i = 0; i < json2.length; i++) {
      const current_date = new Date(json2[i]["date"]);
      for (j = 0; j < 24; j++) {
        temp_date = decrementHours(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getHours() - j].push(
            parseFloat(json2[i]["temperature"])
          );
          hum_dict[start_date.getHours() - j].push(
            parseFloat(json2[i]["humidity"])
          );
          box2_eggs_dict[start_date.getHours() - j].unshift(
            parseInt(json2[i]["numberOfEggs"])
          );
          j = 24;
        }
      }
    }

    const temp_final = {};
    const hum_final = {};
    const box1_eggs_final = {};
    const box2_eggs_final = {};

    for (const key in temp_dict) {
      var temp_sum = 0;
      var hum_sum = 0;
      var box1_eggs_sum = 0;
      var box2_eggs_sum = 0;

      for (i = 0; i < temp_dict[key].length; i++) {
        temp_sum += temp_dict[key][i];
        hum_sum += hum_dict[key][i];
      }

      for (j = 0; j < box1_eggs_dict[key].length; j++) {
        if (j == 0) {
          if (!(key - 1 in box1_eggs_dict)) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          } else if (
            box1_eggs_dict[key][j] >
            box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1]
          ) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] -
              box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1];
          } else if (box1_eggs_dict[key - 1].length == 0) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          }
        } else {
          if (box1_eggs_dict[key][j] > box1_eggs_dict[key][j - 1]) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] - box1_eggs_dict[key][j - 1];
          }
        }
      }

      for (k = 0; k < box2_eggs_dict[key].length; k++) {
        if (k == 0) {
          if (!(key - 1 in box2_eggs_dict)) {
            box2_eggs_sum += box2_eggs_dict[key][j];
          } else if (
            box2_eggs_dict[key][k] >
            box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1]
          ) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] -
              box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1];
          } else if (box2_eggs_dict[key - 1].length == 0) {
            box2_eggs_sum += box2_eggs_dict[key][k];
          }
        } else {
          if (box2_eggs_dict[key][k] > box2_eggs_dict[key][k - 1]) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] - box2_eggs_dict[key][k - 1];
          }
        }
      }

      temp_final[key] = temp_sum / temp_dict[key].length;
      hum_final[key] = hum_sum / hum_dict[key].length;
      box1_eggs_final[key] = box1_eggs_sum;
      box2_eggs_final[key] = box2_eggs_sum;

      if (isNaN(temp_final[key])) {
        temp_final[key] = 0;
      }
      if (isNaN(hum_final[key])) {
        hum_final[key] = 0;
      }
      if (isNaN(box1_eggs_final[key])) {
        box1_eggs_final[key] = 0;
      }
      if (isNaN(box2_eggs_final[key])) {
        box2_eggs_final[key] = 0;
      }
    }

    const data = {
      temperature: temp_final,
      humidity: hum_final,
      box1_eggs: box1_eggs_final,
      box2_eggs: box2_eggs_final,
    };
    return data;
  } else if (interval == "Week") {
    /*
    If the interval is 'Week' we grab data from the database using apis between the current date and
    7 days earlier. The data includes temperature, humidity, and number of eggs. We split the data
    up by days and then for each day we calculate the average for temperature and humidity. For
    number of eggs we take the sum. We take the average and sum of all boxes in the given coop and
    return it to the web app to be graphed.
    */

    const start_date = new Date();
    start_date.setDate(start_date.getDate() + 1);
    start_date.setHours(0);
    start_date.setMinutes(0);
    start_date.setSeconds(0);
    start_date.setMilliseconds(0);
    var end_date = new Date(start_date);
    end_date = decrementDays(end_date, 7);

    var i, j, k;
    var temp_dict = {};
    var hum_dict = {};
    var box1_eggs_dict = {};
    var box2_eggs_dict = {};

    for (i = 0; i < 7; i++) {
      temp_dict[start_date.getDate() - i - 1] = [];
      hum_dict[start_date.getDate() - i - 1] = [];
      box1_eggs_dict[start_date.getDate() - i - 1] = [];
      box2_eggs_dict[start_date.getDate() - i - 1] = [];
    }

    const response1 = await fetch(
      API_URL +
        "api/box/1/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json1 = await response1.json();

    var temp_date;
    for (i = 0; i < json1.length; i++) {
      const current_date = new Date(json1[i]["date"]);
      for (j = 1; j <= 7; j++) {
        temp_date = decrementDays(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getDate() - j].push(
            parseFloat(json1[i]["temperature"])
          );
          hum_dict[start_date.getDate() - j].push(
            parseFloat(json1[i]["humidity"])
          );
          box1_eggs_dict[start_date.getDate() - j].unshift(
            parseInt(json1[i]["numberOfEggs"])
          );
          j = 8;
        }
      }
    }

    const response2 = await fetch(
      API_URL +
        "api/box/2/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json2 = await response2.json();

    for (i = 0; i < json2.length; i++) {
      const current_date = new Date(json2[i]["date"]);
      for (j = 1; j <= 7; j++) {
        temp_date = decrementDays(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getDate() - j].push(
            parseFloat(json2[i]["temperature"])
          );
          hum_dict[start_date.getDate() - j].push(
            parseFloat(json2[i]["humidity"])
          );
          box2_eggs_dict[start_date.getDate() - j].unshift(
            parseInt(json2[i]["numberOfEggs"])
          );
          j = 8;
        }
      }
    }
    const temp_final = {};
    const hum_final = {};
    const box1_eggs_final = {};
    const box2_eggs_final = {};
    for (const key in temp_dict) {
      var temp_sum = 0;
      var hum_sum = 0;
      var box1_eggs_sum = 0;
      var box2_eggs_sum = 0;

      for (i = 0; i < temp_dict[key].length; i++) {
        temp_sum += temp_dict[key][i];
        hum_sum += hum_dict[key][i];
      }

      for (j = 0; j < box1_eggs_dict[key].length; j++) {
        if (j == 0) {
          if (!(key - 1 in box1_eggs_dict)) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          } else if (
            box1_eggs_dict[key][j] >
            box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1]
          ) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] -
              box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1];
          } else if (box1_eggs_dict[key - 1].length == 0) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          }
        } else {
          if (box1_eggs_dict[key][j] > box1_eggs_dict[key][j - 1]) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] - box1_eggs_dict[key][j - 1];
          }
        }
      }

      for (k = 0; k < box2_eggs_dict[key].length; k++) {
        if (k == 0) {
          if (!(key - 1 in box2_eggs_dict)) {
            box2_eggs_sum += box2_eggs_dict[key][k];
          } else if (
            box2_eggs_dict[key][k] >
            box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1]
          ) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] -
              box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1];
          } else if (box2_eggs_dict[key - 1].length == 0) {
            box2_eggs_sum += box2_eggs_dict[key][k];
          }
        } else {
          if (box2_eggs_dict[key][k] > box2_eggs_dict[key][k - 1]) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] - box2_eggs_dict[key][k - 1];
          }
        }
      }

      temp_final[key] = temp_sum / temp_dict[key].length;
      hum_final[key] = hum_sum / hum_dict[key].length;
      box1_eggs_final[key] = box1_eggs_sum;
      box2_eggs_final[key] = box2_eggs_sum;

      if (isNaN(temp_final[key])) {
        temp_final[key] = 0;
      }
      if (isNaN(hum_final[key])) {
        hum_final[key] = 0;
      }
      if (isNaN(box1_eggs_final[key])) {
        box1_eggs_final[key] = 0;
      }
      if (isNaN(box2_eggs_final[key])) {
        box2_eggs_final[key] = 0;
      }
    }

    const data = {
      temperature: temp_final,
      humidity: hum_final,
      box1_eggs: box1_eggs_final,
      box2_eggs: box2_eggs_final,
    };
    return data;
  } else if (interval == "Month") {
    /*
    If the interval is 'Month' we grab data from the database using apis between the current date and
    30 days earlier. The data includes temperature, humidity, and number of eggs. We split the data
    up by days and then for each day we calculate the average for temperature and humidity. For
    number of eggs we take the sum. We take the average and sum of all boxes in the given coop and
    return it to the web app to be graphed.
    */
    const start_date = new Date();
    start_date.setDate(start_date.getDate() + 1);
    start_date.setHours(0);
    start_date.setMinutes(0);
    start_date.setSeconds(0);
    start_date.setMilliseconds(0);
    var end_date = new Date(start_date);
    end_date = decrementDays(end_date, 30);

    var i, j, k;
    var temp_dict = {};
    var hum_dict = {};
    var box1_eggs_dict = {};
    var box2_eggs_dict = {};

    for (i = 0; i < 30; i++) {
      temp_dict[start_date.getDate() - i - 1] = [];
      hum_dict[start_date.getDate() - i - 1] = [];
      box1_eggs_dict[start_date.getDate() - i - 1] = [];
      box2_eggs_dict[start_date.getDate() - i - 1] = [];
    }

    const response1 = await fetch(
      API_URL +
        "api/box/1/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json1 = await response1.json();

    var temp_date;
    for (i = 0; i < json1.length; i++) {
      const current_date = new Date(json1[i]["date"]);
      for (j = 1; j <= 30; j++) {
        temp_date = decrementDays(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getDate() - j].push(json1[i]["temperature"]);
          hum_dict[start_date.getDate() - j].push(json1[i]["humidity"]);
          box1_eggs_dict[start_date.getDate() - j].unshift(
            json1[i]["numberOfEggs"]
          );
          j = 31;
        }
      }
    }

    const response2 = await fetch(
      API_URL +
        "api/box/2/dates?" +
        new URLSearchParams({
          end_date: end_date.toISOString(),
          start_date: start_date.toISOString(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "123456",
        },
      }
    );
    const json2 = await response2.json();

    for (i = 0; i < json2.length; i++) {
      const current_date = new Date(json2[i]["date"]);
      for (j = 1; j <= 30; j++) {
        temp_date = decrementDays(new Date(start_date), j);
        if (current_date > temp_date) {
          temp_dict[start_date.getDate() - j].push(json2[i]["temperature"]);
          hum_dict[start_date.getDate() - j].push(json2[i]["humidity"]);
          box2_eggs_dict[start_date.getDate() - j].unshift(
            json2[i]["numberOfEggs"]
          );
          j = 31;
        }
      }
    }

    const temp_final = {};
    const hum_final = {};
    const box1_eggs_final = {};
    const box2_eggs_final = {};
    for (const key in temp_dict) {
      var temp_sum = 0;
      var hum_sum = 0;
      var box1_eggs_sum = 0;
      var box2_eggs_sum = 0;

      for (i = 0; i < temp_dict[key].length; i++) {
        temp_sum += temp_dict[key][i];
        hum_sum += hum_dict[key][i];
      }

      for (j = 0; j < box1_eggs_dict[key].length; j++) {
        if (j == 0) {
          if (!(key - 1 in box1_eggs_dict)) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          } else if (
            box1_eggs_dict[key][j] >
            box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1]
          ) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] -
              box1_eggs_dict[key - 1][box1_eggs_dict[key - 1].length - 1];
          } else if (box1_eggs_dict[key - 1].length == 0) {
            box1_eggs_sum += box1_eggs_dict[key][j];
          }
        } else {
          if (box1_eggs_dict[key][j] > box1_eggs_dict[key][j - 1]) {
            box1_eggs_sum +=
              box1_eggs_dict[key][j] - box1_eggs_dict[key][j - 1];
          }
        }
      }

      for (k = 0; k < box2_eggs_dict[key].length; k++) {
        if (k == 0) {
          if (!(key - 1 in box2_eggs_dict)) {
            box2_eggs_sum += box2_eggs_dict[key][j];
          } else if (
            box2_eggs_dict[key][k] >
            box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1]
          ) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] -
              box2_eggs_dict[key - 1][box2_eggs_dict[key - 1].length - 1];
          } else if (box2_eggs_dict[key - 1].length == 0) {
            box2_eggs_sum += box2_eggs_dict[key][k];
          }
        } else {
          if (box2_eggs_dict[key][k] > box2_eggs_dict[key][k - 1]) {
            box2_eggs_sum +=
              box2_eggs_dict[key][k] - box2_eggs_dict[key][k - 1];
          }
        }
      }

      temp_final[key] = temp_sum / temp_dict[key].length;
      hum_final[key] = hum_sum / hum_dict[key].length;
      box1_eggs_final[key] = box1_eggs_sum;
      box2_eggs_final[key] = box2_eggs_sum;

      if (isNaN(temp_final[key])) {
        temp_final[key] = 0;
      }
      if (isNaN(hum_final[key])) {
        hum_final[key] = 0;
      }
      if (isNaN(box1_eggs_final[key])) {
        box1_eggs_final[key] = 0;
      }
      if (isNaN(box2_eggs_final[key])) {
        box2_eggs_final[key] = 0;
      }
    }

    const data = {
      temperature: temp_final,
      humidity: hum_final,
      box1_eggs: box1_eggs_final,
      box2_eggs: box2_eggs_final,
    };
    return data;
  } else {
    return "Invalid Interval";
  }
}

/*
decrementHours takes in a date object and integer value representing the ammount of 
hours being subtracted. This function subtracts hours off of the input date and decrements
the day if the amount of hours subtracted goes into the previous day.
*/
function decrementHours(datetime, hour) {
  if (datetime.getHours() >= hour) {
    datetime.setHours(datetime.getHours() - hour);
  } else {
    hour = hour - datetime.getHours();
    datetime = decrementDays(datetime, 1);
    datetime.setHours(24 - hour);
  }
  return datetime;
}

/*
decrementDays takes in a date object and integer value representing the ammount of 
days being subtracted. This function subtracts days off of the input date and decrements
the month if the amount of days subtracted goes into the previous month.
*/
function decrementDays(datetime, days) {
  if (datetime.getDate() > days) {
    datetime.setDate(datetime.getDate() - days);
  } else {
    days = days - datetime.getDate();
    datetime = decrementMonths(datetime, 1);
    datetime.setDate(
      getDaysInMonth(datetime.getYear(), datetime.getMonth()) - days
    );
  }
  return datetime;
}

/*
decrementMonths takes in a date object and integer value representing the ammount of 
months being subtracted. This function subtracts months off of the input date and
decrements the year if the amount of months subtracted goes into the previous year.
*/
function decrementMonths(datetime, months) {
  if (datetime.getMonth() > months) {
    datetime.setMonth(datetime.getMonth() - months);
  } else {
    months = months - datetime.getMonth();
    datetime.setYear(datetime.getYear() - 1);
    datetime.setMonth(12 - months);
  }
  return datetime;
}

// getDaysInMonth takes in a month and year and returns the total days in the month
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/*
sendEmail is called when there is an egg found in a box. This function checks to
see if the current time is greater than the email_next_send time. If so an email
is sent to all users logged in the database. The email_next_send time is changed
to the current time of the server's startup and then when emails are sent is
changed to the time of sending plus 2 hours. This is so the users will not get
hundreds of emails over a limited time period.
*/
async function sendEmail() {
  const now = new Date();
  if (email_next_send < now) {
    console.log("\nSENDING EMAIL NOTIFICATION");
    email_next_send = new Date(now);
    email_next_send.setTime(email_next_send.getTime() + 120 * 60 * 1000);
    const params = {};

    const resp = await fetch(API_URL + "api/users/1/users", {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization: "123456" },
    });
    const json = await resp.json();
    json.forEach(async (user) => {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "SamuelNicklaus1@gmail.com",
          pass: "sahnaovwhjrzztqx",
        },
      });

      let info = await transporter.sendMail({
        from: "SamuelNicklaus1@gmail.com",
        to: user["email"],
        subject: "You Got Egg",
        text:
          user["name"] +
          ",\n\n\tYou have an egg ready for retrieval in your coop!\n\nThank You for supporting the Overly Easy Eggs Team!",
      });
    });
  }
}

exports.sendEmail = sendEmail;
