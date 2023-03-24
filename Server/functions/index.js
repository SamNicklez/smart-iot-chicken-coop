const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const cors = require("cors");
const app = express();
app.use(cors({origin: true}));
const socket = require("socket.io");

const listener = app.listen(5000, "172.17.38.134", () => {
  console.log("Your app is listening on port " + listener.address().port);
});

const serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iotfinalproject-db88d-default-rtdb.firebaseio.com"});
const db = admin.firestore();

////////////////////////////////////////////////////////////////////////////////////////////
// CAMERA

// POST new camera
app.post("/api/camera", jsonParser, (req, res) => {
  (async () => {
    try {
      await db.collection("camera").doc("/" + req.body.id + "/").create({
        box: req.body.box,
        coop: req.body.coop,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// PATCH camera's coop and box
app.patch("/api/camera", jsonParser, (req, res) => {
  (async () => {
    try {
      const document = db.collection("camera").doc(req.body.id);
      await document.update({
        box: req.body.box,
        coop: req.body.coop,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// GET all camera info
app.get("/api/camera", (req, res) => {
  (async () => {
    try {
      const query = db.collection("camera");
      const response = [];
      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs;
        for (const doc of docs) {
          const selectedItem = {
            id: doc.id,
            box: doc.data().box,
            coop: doc.data().coop,
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

// GET specific camera info
app.get("/api/camera/:camera_id", jsonParser, (req, res) => {
  (async () => {
    try {
      const query = db.collection("camera").doc(req.params.camera_id);
      const response = await query.get().then((querySnapshot) => {
        const doc = querySnapshot;
        const selectedItem = {
          id: req.params.camera_id,
          box: doc.data().box,
          coop: doc.data().coop,
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

// DELETE camera
app.delete("/api/camera/:camera_id", jsonParser, (req, res) => {
  (async () => {
    try {
      const document = db.collection("camera").doc(req.params.camera_id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

////////////////////////////////////////////////////////////////////////////////////////////
// CHICKEN

// POST chicken entering coop
app.post("/api/chicken", jsonParser, (req, res) => {
  (async () => {
    try {
      await db.collection("chicken").doc("/" + req.body.enter_date + "/").create({
        box: req.body.box,
        coop: req.body.coop,
        enter_date: req.body.enter_date,
        exit_date: null,
        enter_mass: req.body.enter_mass,
        exit_mass: null,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});


// PATCH chicken exiting coop
app.patch("/api/chicken", jsonParser, (req, res) => {
  (async () => {
    try {
      const document = db.collection("chicken").doc(req.body.enter_date);
      await document.update({
        exit_date: req.body.exit_date,
        exit_mass: req.body.exit_mass,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// GET chicken data
app.get("/api/chicken", (req, res) => {
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
              enter_mass: doc.data().enter_mass,
              exit_date: doc.data().exit_date,
              exit_mass: doc.data().exit_mass,
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
  else {
    (async () => {
      try {
        const query = db.collection("chicken").orderBy("enter_date", "desc").limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              enter_mass: doc.data().enter_mass,
              exit_date: doc.data().exit_date,
              exit_mass: doc.data().exit_mass,
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
app.get("/api/chicken/dates", (req, res) => {
    (async () => {
      try {
        const query = db.collection("chicken")
        .orderBy("enter_date", "desc")
        .startAt(parseInt(req.query.end_date))
        .endAt(parseInt(req.query.start_date));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          console.log(docs);
          for (const doc of docs) {
            const selectedItem = {
              box: doc.data().box,
              coop: doc.data().coop,
              enter_date: doc.data().enter_date,
              enter_mass: doc.data().enter_mass,
              exit_date: doc.data().exit_date,
              exit_mass: doc.data().exit_mass,
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

////////////////////////////////////////////////////////////////////////////////////////////
// BOX

// POST box
app.post("/api/box", jsonParser, (req, res) => {
  (async () => {
    try {
      await db.collection("box").doc("/" + req.body.box_id + "/").collection("boxData").doc("/" + "init data" + "/").create({})
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

// POST box info
app.post("/api/box/:box_id", jsonParser, (req, res) => {
  (async () => {
    try {
      await db.collection("box").doc("/" + req.params.box_id + "/").collection("boxData").doc("/" + req.body.date + "/").create({
          date: req.body.date,
          hasEgg: req.body.hasEgg,
          temperature: req.body.temperature,
          light: req.body.light,
        });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
})

// GET specific box info
app.get("/api/box/:box_id", (req, res) => {
  if (req.query.numberOfRecords == undefined) {
    (async () => {
      try {
        const query = db.collection("box").doc("/" + req.params.box_id + "/").collection("boxData").orderBy("date", "desc");
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              hasEgg: doc.data().hasEgg,
              temperature: doc.data().temperature,
              light: doc.data().light,
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
  else {
    (async () => {
      try {
        const query = db.collection("box").doc("/" + req.params.box_id + "/").collection("boxData").orderBy("date", "desc").limit(parseInt(req.query.numberOfRecords));
        const response = [];
        await query.get().then((querySnapshot) => {
          const docs = querySnapshot.docs;
          for (const doc of docs) {
            const selectedItem = {
              date: doc.data().date,
              hasEgg: doc.data().hasEgg,
              temperature: doc.data().temperature,
              light: doc.data().light,
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
})

// GET specific box info between 2 dates
app.get("/api/box/:box_id/dates", (req, res) => {
  (async () => {
    try {
      const query = db.collection("box")
      .doc("/" + req.params.box_id + "/")
      .collection("boxData")
      .orderBy("date", "desc")
      .startAt(parseInt(req.query.end_date))
      .endAt(parseInt(req.query.start_date));
      const response = [];
      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs;
        for (const doc of docs) {
          const selectedItem = {
            date: doc.data().date,
            hasEgg: doc.data().hasEgg,
            temperature: doc.data().temperature,
            light: doc.data().light,
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
})

// DELETE box
app.delete("/api/box/:box_id", jsonParser, (req, res) => {
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

exports.app = functions.https.onRequest(app);
