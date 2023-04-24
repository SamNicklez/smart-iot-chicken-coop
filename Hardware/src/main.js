import fetch from 'node-fetch'

const URL = "https://coop-final-project.glitch.me/"

testPostBox();

////////////////////////////////////////////////////////////////////////////////////////////////
// CAMERA

async function createCamera(id, box, coop) {
    fetch(URL + "api/camera", {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            box: box,
            coop: coop,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
    })
}

async function editCamera(id, box, coop) {
    fetch(URL + "api/camera", {
        method: 'PATCH',
        body: JSON.stringify({
            id: id,
            box: box,
            coop: coop,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
    })
}

async function getOneCamera(id) {
    var response = await fetch(URL + `api/camera/${id}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
          }
    })
    .then((response) => response.json())
    return response;
}

async function getCameras() {
    fetch(URL + `api/camera`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
          }
    })
    .then((response) => response.json())
    return response;
}


////////////////////////////////////////////////////////////////////////////////////////////////
// CHICKEN

async function chickenEntered(box, coop, enter_date, enter_mass) {
    fetch(URL + "api/chicken", {
        method: 'POST',
        body: JSON.stringify({
            box: box,
            coop: coop,
            enter_date: enter_date,
            enter_mass: enter_mass,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
    })
}

async function chickenExited(enter_date, exit_date, exit_mass) {
    fetch(URL + "api/chicken", {
        method: 'PATCH',
        body: JSON.stringify({
            enter_date: enter_date,
            exit_date: exit_date,
            exit_mass: exit_mass,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
    })
}

async function getNumRecords(num) {
    var response = await fetch(URL + `api/chicken/?numberOfRecords=${num}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
          }
    })
    .then((response) => response.json())
    return response;
}

async function getRecords() {
    var response = await fetch(URL + "api/chicken", {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
          }
    })
    .then((response) => response.json())
    return response;
}




////////////////////////////////////////////////////////////
// TESTS

async function postBoxData(box_id, hasEgg, temperature, light, humidity) {
    fetch(URL + "api/box/" + box_id, {
        method: 'POST',
        body: JSON.stringify({
            date: new Date().toISOString(),
            hasEgg: hasEgg,
            temperature: temperature,
            light: light,
            humidity: humidity,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function testPostBox(){
    var hasEgg = true;
    var temperature = 123;
    var light = 1;
    var humidity = 12312;
    postBoxData(1, hasEgg, temperature, light, humidity);
}

async function testChicken(){
    var coop = "coop1"
    var enter_date = "4:00"
    var enter_mass = 15
    var exit_date = "12:21"
    var exit_mass = 13
    
    chickenEntered(coop, enter_date, enter_mass)
    console.log("chicken entered")
    chickenExited(enter_date, exit_date, exit_mass)
    console.log("chicken exited")
}

async function testGetRecords() {
    var resp = await getNumRecords(4);
    console.log(resp);
    var resp = await getRecords();
    console.log(resp);
}


const delay = ms => new Promise(res => setTimeout(res, ms));

async function makeChickens(num) {
    for (let n = 0; n < num; n++) {
        var date = new Date();
        await chickenEntered(n, n, n, n)
        await chickenExited(n, n, n)
    }
}

async function testCamera() {
    await editCamera("CAM1", 1, "COOP1")
    var resp = await getOneCamera("CAM1")
    console.log(resp)
    await editCamera("CAM1", 2, "COOP2")
    var resp = await getOneCamera("CAM1")
    console.log(resp)

    var resp = await getCameras()
    console.log(resp)
}

