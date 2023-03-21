const coop = "coop1"
const enter_date = "7:00"
const enter_mass = 15
const exit_date = "8:21"
const exit_mass = 13

chickenEntered(coop, enter_date, enter_mass)
chickenExited(enter_date, exit_date, exit_mass)


async function chickenEntered(coop, enter_date, enter_mass) {
    const fetch = require("node-fetch");
    fetch("http://172.17.9.55:5000/api/chicken", {
        method: 'POST',
        body: JSON.stringify({
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
    const fetch = require("node-fetch");
    fetch("http://172.17.9.55:5000/api/chicken", {
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

