URL = "http://172.17.38.134:5000/"

async function chickenEntered(box, coop, mass) {
    body = {
        "box": box,
        "coop": coop,
        "enter_date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "enter_mass": mass,
    }
    const response = await fetch(URL+"api/chicken", {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
          }
    });
    const json = await response.json();
    return json;
}

async function chickenExited(enter_date, exit_mass) {
    body = {
        "enter_date": enter_date,
        "exit_date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "exit_mass": exit_mass,
    }
    const response = await fetch(URL+"api/chicken", {
        method: 'PATCH',
        body: body,
        headers: {
            'Content-Type': 'application/json'
          }
    });
    const json = await response.json();
    return json;
}

async function postBoxData(box_id, hasEgg, temperature, light, humidity) {
    body = {
        "date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "hasEgg": hasEgg,
        "temperature": temperature,
        "light": light,
        "humidity": humidity,
    }
    const response = await fetch(URL+"api/box/"+box_id, {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
          }
    });
    const json = await response.json();
    return json;
}



    