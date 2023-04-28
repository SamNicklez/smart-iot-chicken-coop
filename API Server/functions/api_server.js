const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
const socket = require("socket.io");

const listener = app.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

app.use(express.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(creds),
  databaseURL: "https://iotfinalproject-db88d-default-rtdb.firebaseio.com",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

function isAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth === "123456") {
    next();
  } else {
    res.status(401);
    res.send("Access forbidden");
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// USER TABLE

// POST new user
app.post("/api/users", isAuth, (req, res) => {
  (async () => {
    try {
      await db
        .collection("users")
        .doc("/1/")
        .collection("/users/")
        .doc(req.body.email)
        .create({
          name: req.body.name,
          email: req.body.email,
        });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// GET coop_code
app.get("/api/users/:coop_id", isAuth, (req, res) => {
  (async () => {
    try {
      const query = await db
        .collection("users")
        .doc("/" + req.params.coop_id + "/");
      const response = await query.get().then((querySnapshot) => {
        const doc = querySnapshot;
        const selectedItem = {
          coop_code: doc.data().coop_code,
        };
        return selectedItem;
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// GET users
app.get("/api/users/:coop_id/users", isAuth, (req, res) => {
  (async () => {
    try {
      const query = db
        .collection("users")
        .doc("/" + req.params.coop_id + "/")
        .collection("users");
      const response = [];
      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs;
        for (const doc of docs) {
          const selectedItem = {
            name: doc.data().name,
            email: doc.data().email,
          };
          response.push(selectedItem);
        }
        return response;
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// DELETE user
app.delete("/api/users/:coop_id/:email", isAuth, (req, res) => {
  (async () => {
    try {
      const document = db
        .collection("users")
        .doc("/" + req.params.coop_id + "/")
        .collection("users")
        .doc("/" + req.params.email + "/");
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

////////////////////////////////////////////////////////////////////////////////////////////
// CHICKEN TABLE

// POST chicken entering coop
app.post("/api/chicken", isAuth, (req, res) => {
  (async () => {
    try {
      await db
        .collection("chicken")
        .doc("/" + req.body.enter_date + "/")
        .create({
          box: req.body.box,
          coop: req.body.coop,
          enter_date: req.body.enter_date,
          exit_date: null,
        });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// PATCH chicken exiting coop
app.patch("/api/chicken", isAuth, (req, res) => {
  (async () => {
    try {
      const document = db.collection("chicken").doc(req.body.enter_date);
      await document.update({
        exit_date: req.body.exit_date,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// GET chicken data
app.get("/api/chicken", isAuth, (req, res) => {
  if (req.query.numberOfRecords == undefined) {
    (async () => {
      try {
        const query = db.collection("chicken").orderBy("enter_date", "desc");
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              exit_date: doc.data().exit_date,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  } else {
    (async () => {
      try {
        const query = db
          .collection("chicken")
          .orderBy("enter_date", "desc")
          .limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              exit_date: doc.data().exit_date,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  }
});

// GET chicken data between 2 dates
app.get("/api/chicken/dates", isAuth, (req, res) => {
  if (req.query.numberOfRecords == undefined) {
    (async () => {
      try {
        const query = db
          .collection("chicken")
          .orderBy("enter_date", "desc")
          .startAt(req.query.start_date)
          .endAt(req.query.end_date);
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          console.log(docs);
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              exit_date: doc.data().exit_date,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  } else {
    (async () => {
      try {
        const query = db
          .collection("chicken")
          .orderBy("enter_date", "desc")
          .startAt(req.query.start_date)
          .endAt(req.query.end_date)
          .limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              exit_date: doc.data().exit_date,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
// BOX TABLE

// POST box
app.post("/api/box", isAuth, (req, res) => {
  (async () => {
    try {
      await db
        .collection("box")
        .doc("/" + req.body.box_id + "/")
        .collection("boxData")
        .doc("/" + "init data" + "/")
        .create({});
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// POST box info
app.post("/api/box/:box_id", isAuth, (req, res) => {
  (async () => {
    try {
      await db
        .collection("box")
        .doc("/" + req.params.box_id + "/")
        .collection("boxData")
        .doc("/" + req.body.date + "/")
        .create({
          date: req.body.date,
          numberOfEggs: req.body.numberOfEggs,
          temperature: req.body.temperature,
          light: req.body.light,
          humidity: req.body.humidity,
        });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// GET specific box info
app.get("/api/box/:box_id", isAuth, (req, res) => {
  if (req.query.numberOfRecords == undefined) {
    (async () => {
      try {
        const query = db
          .collection("box")
          .doc("/" + req.params.box_id + "/")
          .collection("boxData")
          .orderBy("date", "desc");
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              numberOfEggs: doc.data().numberOfEggs,
              temperature: doc.data().temperature,
              light: doc.data().light,
              humidity: doc.data().humidity,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  } else {
    (async () => {
      try {
        const query = db
          .collection("box")
          .doc("/" + req.params.box_id + "/")
          .collection("boxData")
          .orderBy("date", "desc")
          .limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              numberOfEggs: doc.data().numberOfEggs,
              temperature: doc.data().temperature,
              light: doc.data().light,
              humidity: doc.data().humidity,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  }
});

// GET specific box info between 2 dates
app.get("/api/box/:box_id/dates", isAuth, (req, res) => {
  if (req.query.numberOfRecords == undefined) {
    (async () => {
      try {
        const query = db
          .collection("box")
          .doc("/" + req.params.box_id + "/")
          .collection("boxData")
          .orderBy("date", "desc")
          .startAt(req.query.start_date)
          .endAt(req.query.end_date);
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              numberOfEggs: doc.data().numberOfEggs,
              temperature: doc.data().temperature,
              light: doc.data().light,
              humidity: doc.data().humidity,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  } else {
    (async () => {
      try {
        const query = db
          .collection("box")
          .doc("/" + req.params.box_id + "/")
          .collection("boxData")
          .orderBy("date", "desc")
          .startAt(req.query.start_date)
          .endAt(req.query.end_date)
          .limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              numberOfEggs: doc.data().numberOfEggs,
              temperature: doc.data().temperature,
              light: doc.data().light,
              humidity: doc.data().humidity,
            };
            response.push(selectedItem);
          }
          return response;
        });
        return res.status(200).send(response);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  }
});

// DELETE box
app.delete("/api/box/:box_id", isAuth, (req, res) => {
  (async () => {
    try {
      const document = db.collection("box").doc(req.params.box_id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

////////////////////////////////////////////////////////////////////////////////////////////
//SETTINGS TABLE

// GET settings
app.get("/api/settings", isAuth, (req, res) => {
  (async () => {
    try {
      const query = db.collection("settings").doc("settings");
      const response = await query.get().then((querySnapshot) => {
        const doc = querySnapshot;
        const selectedItem = {
          autoLight: doc.data().autoLight,
          brightness: doc.data().brightness,
          tempMax: doc.data().tempMax,
          tempMin: doc.data().tempMin,
        };
        return selectedItem;
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// PATCH settings
app.patch("/api/settings", isAuth, (req, res) => {
  (async () => {
    try {
      const document = db.collection("settings").doc("settings");
      await document.update({
        autoLight: req.body.autoLight,
        brightness: req.body.brightness,
        tempMax: req.body.tempMax,
        tempMin: req.body.tempMin,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
