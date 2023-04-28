import { io } from 'socket.io-client'; // socket.io for communicating with the server
import { createBluetooth } from 'node-ble'; // bluetooth library for arduino communication
import { Gpio } from 'pigpio'; // library for GPIO to LED lights
import fs from 'fs'; // library for reading pictures from a path to an object
import { takePicture } from './cameraTest.js'; // js file that contains a method that takes a picture

const ARDUINO_BLUETOOTH_ADDR = 'A4:36:D1:87:B9:79'; // arudino bluetooth address

// ESS service stuff
const EES_SERVICE_UUID          = '0000181a-0000-1000-8000-00805f9b34fb';
const TEMP_CHAR_UUID            = '00002a6e-0000-1000-8000-00805f9b34fb';
const HUMID_CHAR_UUID           = '00002a6f-0000-1000-8000-00805f9b34fb';

// UART stuff
const UART_SERVICE_UUID         = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const TX_CHARACTERISTIC_UUID    = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID    = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const LIGHT_CHARACTERISTIC_UUID = '6E400004-B5A3-F393-E0A9-E50E24DCCA9E';

// initial default values for variables
var tempMax = 1000;
var tempMin = -1000;
var temperature = -100;
var humidity = -100;
var light = -100;
const NUMBOXES = 2;
var lightMode = 'Auto';

const PWM_FREQUENCY = 10000; // Hz
const PWM_RANGE = 255;

const green = [0,0];

// Making pins for the leds and using pwm to control brightness
const whiteLED = new Gpio(18, {mode: Gpio.OUTPUT});
const greenLED = new Gpio(13, {mode: Gpio.OUTPUT});
const redLED = new Gpio(19, {mode: Gpio.OUTPUT});
const blueLED = new Gpio(12, {mode: Gpio.OUTPUT});

// Set the PWM frequency and range
whiteLED.hardwarePwmWrite(PWM_FREQUENCY, PWM_RANGE);
redLED.hardwarePwmWrite(PWM_FREQUENCY, PWM_RANGE);
greenLED.hardwarePwmWrite(PWM_FREQUENCY, PWM_RANGE);
blueLED.hardwarePwmWrite(PWM_FREQUENCY, PWM_RANGE);

var humidTemp, celsiusValue;

// make an array of boxes
const boxes = [];
const cameras = [0,2];

// variable to hold the brightness that the user sets when in manual mode
var whiteBrightness = 0;

// the Coop's ID
var coopID = 8753025873489;

// make the connection to the server using the auth ID in the header for authentication
let socket = io('https://coop-project-server.glitch.me', { query: `AuthID=${coopID}` });

// function for when the server says to change the settings
socket.on( 'UPDATE_WHITE', async function( data )
{
    console.log('Server requested a white light change: ', data, ' %');
    setLedBrightness('White', data);
    whiteBrightness = data;
});

// update the green light
socket.on( 'UPDATE_GREEN', async function( data )
{
    try {
        // if the box has an egg in it, turn on green lights
        if(data.brightness == 1) {
            console.log('Egg in box! Turning on green lights.....');
            green[data.box-1] = 1;
            greenLED.pwmWrite(255);
        }
        else {
            green[data.box-1] = 0;
            // if both boxes are empty turn off the green lights
            if(green[0] == 0 && green[1] == 0) {
                console.log('Both boxes now with no eggs, turning off green lights....');
                greenLED.pwmWrite(0);  
            }
        }
    }catch {
        console.out('ERROR: Green light change.');
    }
});

// function for server changing temperature settings
socket.on('UPDATE_TEMP_SETTINGS', async function( data )
{
    console.log('User requested a TEMP SETTINGS change, New Temp Max: ', data.tempMax, ' New Temp Min: ', data.tempMin);
    tempMax = parseInt(data.tempMax);
    tempMin = parseInt(data.tempMin);
    checkTemp();
});

// function for server changing light mode
socket.on('LIGHT_MODE', async function( data ) {
    if(data == 1) {
        lightMode = 'Auto';
        console.log('User changed light mode: AUTO' );
    }
    else {
        lightMode = 'Manual';
        console.log('User changed light mode: MANUAL' );
        console.log('Resetting lights to ', whiteBrightness);
    }
});

// initialize the boxes
for(var i = 0; i < NUMBOXES; i++) {
    boxes[i] = i+1;
}

// set intervals for sending data to the server and checking the temp vs temp max/min
setInterval(sendBoxData, 10000);
setInterval(checkTemp, 10000);

async function main()
{
    // Reference the BLE adapter and begin device discovery...
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    const discovery =  await adapter.startDiscovery();
    console.log( 'discovering...' );

    // Attempt to connect to the device with specified BT address
    const device = await adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toUpperCase() );
    console.log( 'found device. attempting connection...' );
    await device.connect();
    console.log( 'connected to device!' );

    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const uartService = await gattServer.getPrimaryService( UART_SERVICE_UUID.toLowerCase() );
    const txChar = await uartService.getCharacteristic( TX_CHARACTERISTIC_UUID.toLowerCase() );
    const rxChar = await uartService.getCharacteristic( RX_CHARACTERISTIC_UUID.toLowerCase() );
    const lightChar = await uartService.getCharacteristic( LIGHT_CHARACTERISTIC_UUID.toLowerCase() );

    // Get references to the desired ESS service and its temparature characteristic.
    const essService = await gattServer.getPrimaryService( EES_SERVICE_UUID.toLowerCase());
    const tempChar = await essService.getCharacteristic( TEMP_CHAR_UUID.toLowerCase() );
    const humidChar = await essService.getCharacteristic( HUMID_CHAR_UUID.toLowerCase() );

    // Set the interval for taking pictures
   
    // Register for notifications on the RX characteristic
    await rxChar.startNotifications();

    // Callback for when data is received on RX characteristic
    rxChar.on( 'valuechanged', buffer =>
    {
        console.log('Received: ' + buffer.toString());
    });

    // Register for notifications on the temperature characteristic
    await humidChar.startNotifications();

    // Callback for when data is received on the temp characteristic
    humidChar.on( 'valuechanged', buffer=>
    {
        // Convert to normal percentage
        const combinedValue = (buffer[1] << 8) | buffer[0];
        humidTemp = combinedValue / 100;
        humidity = humidTemp.toFixed(2);

        console.log('Humidity in percentage from Arduino: ' + humidity);
    });

    // Register for notifications on the temperature characteristic
    await tempChar.startNotifications();

    // Callback for when data is received on the temp characteristic
    tempChar.on( 'valuechanged', buffer=>
    {   // Convert to normal temp
        const combinedValue = (buffer[1] << 8) | buffer[0];
        celsiusValue = combinedValue / 100;
        temperature = celsiusValue.toFixed(2);

        console.log('Temperature in Celsius From Arduino: ' + temperature);
    });

    // Register for notifications on the RX characteristic
    await lightChar.startNotifications( );

    // Callback for when data is received on RX characteristic
    lightChar.on( 'valuechanged', buffer =>
    {
        light = buffer.toString();
        console.log('Light from Arduino: ' + light);
    });

}
main().then((ret) =>
{
    if (ret) console.log( ret );
}).catch((err) =>
{
    if (err) console.error( err );
});

// function to send the data for each box to the server
async function sendBoxData() {
    if(humidity != -100 && temperature != -100 && light != -100) {
       for(var i = 0; i < boxes.length; i++) {
            takePicture(cameras[i]); // take picture with camera i
            await delay(2000); // wait for the picture to be taken and to save the image to the path
        
            // read the pciture that was just taken, convert to base 64
            var imageBuffer = fs.readFileSync("/home/pi/iotFinalProject/cameraImage.jpg");
            var base64Image = imageBuffer.toString('base64');
            const finalImage = "data:image/jpg;base64," + base64Image;

            // send the data to the server
            sendDataToServer(boxes[i], temperature, humidity, light, finalImage);
        }       
    }   
}

// calculate the duty cycle from a percentage
function calculateDuty(percentage) {
    return Math.round(PWM_RANGE * (percentage / 100));
}

// change led function to this:
// Set the brightness of the LED lights on pin 18
async function setLedBrightness(color, brightness) {
    if (color == 'Green') {
        if (parseInt(brightness) == 0) {
            greenLED.pwmWrite(0);
        }
        else {
            greenLED.pwmWrite(255);
        } 
    }
    else if(color == 'Red') {
        if (parseInt(brightness) == 0) {
            redLED.pwmWrite(0);
        }
        else {
            redLED.pwmWrite(255);
        }
    }
    else if(color == 'Blue') {
        if (parseInt(brightness) == 0) {
            blueLED.pwmWrite(0);
        }
        else {
            blueLED.pwmWrite(255);
        }
    }
    else {
        whiteLED.pwmWrite(calculateDuty(brightness));
    }  
}

// send the info to the server
async function sendDataToServer(boxID, temperature, humidity, light, image) {
    const data = {
        coopID: 1,
        boxID: boxID,
        numBoxes: NUMBOXES,
        temperature: temperature,
        humidity: humidity,
        light: light,
        image: image,
      };
    socket.emit('PI_COOP_DATA', data);
    console.log('Sent data to the server');
}

function checkTemp() {
    const currentDate = new Date();
    currentDate.setTime(currentDate.getTime() - (360*60*1000))

    if( lightMode == 'Auto' ) {
        if(currentDate.getHours() > 6 && currentDate.getHours() < 21 && light == 0) {
            setLedBrightness('White', 100);
        }
        else {
            setLedBrightness('White', 0);
        }
    }
    else {
        setLedBrightness('White', whiteBrightness);
    }

    if (temperature > tempMax) {
        // turn on fan
        setLedBrightness('Blue', 100);
    }
    else {
        setLedBrightness('Blue', 0);
    }

    if (temperature < tempMin){
        // turn on heater
        setLedBrightness('Red', 100);
    }
    else {
        setLedBrightness('Red', 0);
    }
}

// function to delay for inputted milliseconds
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
