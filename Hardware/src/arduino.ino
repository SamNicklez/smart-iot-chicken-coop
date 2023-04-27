#include <ArduinoBLE.h>
#include "TimeoutTimer.h"
#include <Arduino_HTS221.h>
#include <Arduino_LSM9DS1.h>
#include <Arduino_APDS9960.h>
#define BUFSIZE 20

// Set up the ess service for both temperature and humidity
BLEService essService("181A");
BLEShortCharacteristic tempChar("2A6E", BLERead | BLENotify );
BLEShortCharacteristic humidChar("2A6F", BLERead | BLENotify );

BLEService uartService("6E400001-B5A3-F393-E0A9-E50E24DCCA9E");
BLEStringCharacteristic txChar("6E400002-B5A3-F393-E0A9-E50E24DCCA9E", BLEWrite, 20 );
BLEStringCharacteristic rxChar("6E400003-B5A3-F393-E0A9-E50E24DCCA9E", BLERead | BLENotify, 20 );
BLEStringCharacteristic lightChar("6E400004-B5A3-F393-E0A9-E50E24DCCA9E", BLERead | BLENotify, 20 );

// variables to keep the last sent values
float lastSentTemp = -100;
float lastSentHumidity = -100;
String light = "0";
String lastSentLight = "";

void setup() {
    // put your setup code here, to run once:
    Serial.begin(9600);
    while(!Serial);

    if (!APDS.begin()) {
      Serial.println("Error initializing APDS-9960 sensor.");
    }
  
    if ( !BLE.begin() )
    {
      Serial.println("Starting BLE failed!");
      while(1);
    }
  
    // Set up the arduino's HTS for collecting temperature data
    if (!HTS.begin()) {
      Serial.println("Failed to initialize humidity temperature sensor!");
      while (1);
    }

    // Set up the APDS for getting light intensity
    if (!APDS.begin()) {
      Serial.println("Error initializing APDS-9960 sensor.");
      while (1);
    }
  
    // Get the Arduino's BT address
    String deviceAddress = BLE.address();

    // The device name we'll advertise with.
    BLE.setLocalName("Arduino Final Project");

    // Get ESS service ready.
    essService.addCharacteristic( tempChar );
    essService.addCharacteristic( humidChar );
    BLE.addService( essService );

    // set up uart
    BLE.setAdvertisedService( uartService );
    uartService.addCharacteristic( rxChar );
    uartService.addCharacteristic( txChar );
    uartService.addCharacteristic( lightChar );
    BLE.addService( uartService );

    // Start advertising our new service.
    BLE.advertise();
    Serial.println("Bluetooth device (" + deviceAddress + ") active, waiting for connections...");
}

void loop() {
  // put your main code here, to run repeatedly:
  // Wait for a BLE central device.
  BLEDevice central = BLE.central();
  

  // If a central device is connected to the peripheral...
  if ( central )
  {
    // Print the central's BT address.
    Serial.print("Connected to central: ");
    Serial.println( central.address() );

    // While the central device is connected...
    while( central.connected() )
    {

      // Receive data from central (if written is true)
      if ( txChar.written() )
      {
        Serial.print("[Recv] ");
        Serial.println( txChar.value()); 
      }

      // getting the light intensity
      if ( APDS.colorAvailable() ) {
        // call the read color to get the light intensity
        int r, g, b, a;
        APDS.readColor(r, g, b, a);

        // Light either 1 or 0
        if ( a > 10 )
        {
          light = "1";
        }
        else {
          light = "0";
        }
       }

      /* 
       *  Emit temperature per ESS' tempChar.
       *  Per the characteristic spec, temp should be in Celsius 
       *  with a resolution of 0.01 degrees. It should also 
       *  be carried within short.
      */
      
      
      // Get the temp from the HTS
       float currTemp = HTS.readTemperature();

      // Get the humidity from the HTS
       float currHumidity = HTS.readHumidity();

      // If the difference between the last sent values is big enough, send it to the pi
      if ( abs(currHumidity - lastSentHumidity) > 1 || abs(currTemp - lastSentTemp) > 1 || lastSentLight != light)
      {

        // Send humidity to central, print to serial monitor
        short shortHumid = (short) (currHumidity*100);
        humidChar.writeValue( shortHumid );      
        Serial.print("Sent Humidity: ");
        Serial.println(currHumidity);
        

        // Cast to desired format; multiply by 100 to keep desired precision.
        short shortTemp = (short) (currTemp * 100);

        // Send temp, print it out
        tempChar.writeValue( shortTemp );
        Serial.print("Sent Temp: ");
        Serial.println(currTemp);

        // send the light value, print it out
        lightChar.writeValue( light );
        Serial.print("Sent Light: ");
        Serial.println(light);
        
        // Set the last sent to the current
        
        lastSentHumidity = currHumidity;
        lastSentTemp = currTemp;
        lastSentLight = light;
      }
      
      // Using the interval characteristic to set the delay/interval for collecting temp
      delay(1000);
      
    }
    
    Serial.print("Disconnected from central: ");
    Serial.println( central.address() );
    
  }
}
