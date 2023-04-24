import { io } from 'socket.io-client';
import { createBluetooth } from 'node-ble';
import { Gpio } from 'pigpio';

const ARDUINO_BLUETOOTH_ADDR = 'A4:36:D1:87:B9:79';

const EES_SERVICE_UUID          = '0000181a-0000-1000-8000-00805f9b34fb';
const TEMP_CHAR_UUID            = '00002a6e-0000-1000-8000-00805f9b34fb';
const HUMID_CHAR_UUID           = '00002a6f-0000-1000-8000-00805f9b34fb';

const UART_SERVICE_UUID         = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const TX_CHARACTERISTIC_UUID    = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID    = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const LIGHT_CHARACTERISTIC_UUID = '6E400004-B5A3-F393-E0A9-E50E24DCCA9E';

const NUMBOXES = 2;

var tempMax = 100;
var temperature = -100;
var humidity = -100;
var light = -100;
var lastBrightness = -1;

const PWM_FREQUENCY = 10000; // Hz
const PWM_RANGE = 255;

// Create a PWM instance on GPIO pin 18
const led = new Gpio(18, {mode: Gpio.OUTPUT});

// Set the PWM frequency and range
led.hardwarePwmWrite(PWM_FREQUENCY, PWM_RANGE);

var humidTemp, celsiusValue;

// make an array of boxes
const boxes = [];

// the Coop's ID
var coopID = 6969;

// make the connection to the server
let socket = io('https://wave-inky-dresser.glitch.me', { query: `AuthID=${coopID}` });

// function for when the server says to change the settings
socket.on( 'UPDATE_SETTINGS', function( data )
{
    console.log('User requested a change: lights: ', data.lights, ' New Temp Threshold: ', data.tempThresh);
    tempMax = data.tempThresh;
    setLedBrightness(data.lights);
});

// initialize the boxes
for(var i = 0; i < NUMBOXES; i++) {
    boxes[i] = i+1;
}

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
    setInterval(sendBoxData, 5000);
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
        // Combine the buffer elements into a single 16-bit integer value
        const combinedValue = (buffer[1] << 8) | buffer[0];
        
        // Convert the combined value to Celsius with precision of 0.01
        humidTemp = combinedValue / 100;
        
        humidity = humidTemp.toFixed(2);

        console.log('Humidity in percentage from Arduino: ' + humidity);
    });

    // Register for notifications on the temperature characteristic
    await tempChar.startNotifications();

    // Callback for when data is received on the temp characteristic
    tempChar.on( 'valuechanged', buffer=>
    {
        
        // Combine the buffer elements into a single 16-bit integer value
        const combinedValue = (buffer[1] << 8) | buffer[0];
        // Convert the combined value to Celsius with precision of 0.01
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

        sendBoxData();
    });


    if (temperature > tempMax) {
        // TODO do whatever here to represent the heater running
    }

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
            // TODO grab image from the camera for box[i]
            const image = null;
            // need to grab a picture from the camera and convert it to be able to send it
            sendDataToServer(boxes[i], temperature, humidity, light, image);
        }       
    }   
}

// Set the brightness of the LED lights on pin 18
async function setLedBrightness(brightness) {
    if (brightness != lastBrightness) {
        console.log('Changing Lights to brightness: ' + brightness + "%");

        // Convert the brightness percentage to a PWM duty cycle
        const dutyCycle = Math.round(PWM_RANGE * (brightness / 100));
        
        // Set the duty cycle on the PWM pin
        led.pwmWrite(dutyCycle);

        lastBrightness = brightness;
    }
}

// send the info to the server
async function sendDataToServer(boxID, temperature, humidity, light, image) {

    // TODO change image here so that it is able to be sent

    const data = {
        coopID: coopID,
        boxID: boxID,
        numBoxes: NUMBOXES,
        temperature: temperature,
        humidity: humidity,
        light: light,
        image: image,
      };

    // Emit the data to the server
    socket.emit('PI_COOP_DATA', data);
    console.log('Sent data to the server');
}
