//import {fetch} from 'node-fetch';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const URL = 'https://coop-project-api.glitch.me/';

async function postBoxData(box_id, numberOfEggs, temperature, light, humidity) { 
    console.log('Calling database API');
    fetch(URL + "api/box/" + box_id, 
    { 
        method: 'POST', body: JSON.stringify(
        { 
            date: new Date().toISOString(), 
            numberOfEggs: numberOfEggs, 
            temperature: temperature, 
            light: light, 
            humidity: humidity, 
        }), 
        headers: { 'Content-Type': 'application/json' } 
    }); 
}

async function chickenEntered(box_id, coop) {
    console.log("CHICKEN ENTERED")
    fetch(URL + "api/chicken", { 
        method: 'POST',
        body: JSON.stringify({
            box: box_id,
            coop: coop, 
            enter_date: new Date().toISOString(),
        }), 
        headers: { 'Content-Type': 'application/json' } 
    }); 
}

async function chickenExited(enter_date) {
    console.log("CHICKEN EXITED")
    fetch(URL + "api/chicken", {
        method: 'PATCH',
        body: JSON.stringify({
            enter_date: enter_date,
            exit_date: new Date().toISOString(),
        }), 
        headers: { 'Content-Type': 'application/json' } 
    });  
}

exports.postBoxData = postBoxData;
exports.chickenEntered = chickenEntered;
exports.chickenExited = chickenExited;
