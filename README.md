# IOT Final Project Report

**Course:** ECE:5550 Internet of Things  
**Team Members:** Samuel Nicklaus, Cole Arduser, Sam Loecke, Luke Farmer  
**Professor:** Tyler Bell  
**Date:** 04/17/2023  
**Source code:** [GitHub Repository](https://github.com/SamNicklez/IOTFinalProject)  

## Project Name: Extra Easy Eggs

## Project Background

The motivation for this project comes from Sam having his own chicken house and wanting to automate egg tracking and know when eggs are laid. The goal is to provide an easy way for a chicken farmer to monitor their egg production and be able to know if there are eggs ready to be picked up. We aimed to show the user egg production compared to different conditions in the coop (temperature, humidity, and light exposure) and inform the user when eggs are laid to eliminate unnecessary trips to the chicken house.

## System Overview

### System Diagram

Our system diagram can be broken up into three distinct sections: the client, the server, and the hardware. For the hardware side, sensors such as cameras and LED light strips are connected physically to the Pi for configuration. Other sensors such as light and temperature data are transmitted via Bluetooth from an Arduino. The data is then processed and sent from the Pi via socket.io to our server.

### Sensors

In this project, we are keeping track of the coop’s temperature, humidity, and light levels. We are also taking pictures to run our machine learning model to tell what is currently in each nesting box. For this, we used temperature, humidity, and ambient light sensors on the Arduino Nano. For the images, we used two USB webcams connected to our Raspberry Pi. The Arduino collects values for temperature, humidity, and light every 10 seconds and sends that data to the Pi only if the new data is significantly different from the last sent value. The Pi uses the webcams to take a picture of each box every 10 seconds and sends all collected data to the server.

### Wireless Communication

The Arduino Nano collects its data and uses Bluetooth to send it to the Pi using ESS service for temperature and humidity values and UART service for light data. The Raspberry Pi receives this data, processes it, and sends the data along with images to the server using client-side node.js socket.io. The server, hosted on Glitch, receives the data, performs analytics, and communicates with the database and web app via HTTP API calls.

### Cloud-Based Storage

We used a Firestore Database to store all data for the chicken coop, accessed via Firebase Admin SDK with a service account. We created APIs that use the service account’s credentials for CRUD operations. All API requests require an authorization header for validation. We used four main tables: box, chicken, settings, and users.

- **Box Table:** Stores data entries with date, humidity, light, number of eggs, and temperature data.
- **Chicken Table:** Logs data for tracking box activity and whether a chicken is in the box.
- **Settings Table:** Holds values for autoLight, brightness, tempMax, and tempMin, which can be changed via the web app.
- **Users Table:** Stores the coop code for signing in and a list of valid user emails for notifications.

### Analytics

Real-time analytics include checking light values from the Arduino and turning on the lights based on a time interval, as well as adjusting fan or heater based on temperature thresholds set by the user. The user can request graphs ranging over one day, one week, or one month for temperature, humidity, light exposure, and number of eggs laid. The server processes these requests, calculates averages, and sends the necessary information to the web app.

### Actions

Our program includes an email notification system to inform the user when an egg is detected. Users log in via Google OAuth and their email is logged on our server for notifications. A time interval can be set to limit the frequency of email notifications, with the default being 2 hours. Users can also change light settings, temperature thresholds, and more through the web app.

### Security

Security measures include:

- **Web App:** Google OAuth for login, a coop code for user association, and security headers for API requests.
- **Socket.io Communication:** Authorization headers for data sent between the Pi and server, a specific coop ID for authentication, and disconnecting unauthorized clients.
- **Database:** Admin SDK for database edits, secured by the API server with authorization headers.

### Privacy and Ethics

Privacy is ensured by not saving any personal user information and using Google sign-in for password security. Images taken are not saved after being used for predictions, and only the most recent picture is saved on the Raspberry Pi.

### Feasibility as a Commercial Project

To make this project commercially viable, improvements in design presentation and expanding the scope to offer full coops instead of just nesting boxes are needed. This would make the product more appealing and practical for consumers.

### Issues Encountered and Lessons Learned

- **Connecting Parts:** Combining individual parts required additional server functionality and different API call methods.
- **Dropping the Pi:** Resulted in data loss and highlighted the importance of code backups.
- **Database Reads:** Exceeded free Firebase limits, leading to a switch to less frequent data writes and reads.

### Group Member Contributions

- **Sam Nicklaus:** Client-side GUI and server conceptualization
- **Cole Arduser:** Server/database creation
- **Sam Loecke:** Arduino and Pi code, built hardware, helped with server
- **Luke Farmer:** Arduino and Pi code, developed machine vision

### Conclusion

We successfully created a prototype smart chicken coop that tracks egg production and coop conditions while offering both auto and manual control via a web interface. Despite challenges, we met our project goals and gained valuable skills for future endeavors.

