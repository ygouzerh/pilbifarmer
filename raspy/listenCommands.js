'use strict';

/**
 * This script listen the commands from the IOT Hub, and send
 * them to the right arduino, using a python program.
 * This script is intended to be ran on a Raspberry Pi
 */

var device = require('azure-iot-device');
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
// Use MQTT as communication protocol
var Protocol = require('azure-iot-device-mqtt').Mqtt;

const spawn = require("child_process").spawn;

var config = require('./config.json');

// Connection string of the device
var connectionString = config.connectionString;

// Create the client
var client = Client.fromConnectionString(connectionString, Protocol);

// Get the deviceID of the raspberry
var deviceId = device.ConnectionString.parse(connectionString).DeviceId;

// Helper function to display informations on a message
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Behavior of the receiver when we have open the connection
var connectCallback = function (err) {
    console.log('Open Azure IoT connection...');

    // Display an error if we receive one
    if(err) {
        console.error('...could not connect: ' + err);
    } else {
        console.log('...client connected');

        // Listen the messages from the iot hub
        client.on('message', function (msg) {
            console.log('*********************************************');
            console.log('**** Message Received - Id: ' + msg.messageId + ' Body: ' + msg.data);
            console.log('*********************************************');
            console.log('Message : ');
            /*
                We receive this payload :
                var payload = {
                    planteId: planteId,
                    action: {
                        name: actionName,
                        mode: {
                            name: modeName,
                            params: params
                        }
                    }
                }
            */
           // TRANSFORM COMMAND INTO A SIMPLER INTEGER CODE TO ARDUINO
            let parsedData = JSON.parse(msg.data);
            console.log(parsedData);	
            let planteId = parsedData.planteId;
            let actionNumber;
            let modeNumber;
            let timeNumber = 0;
            let error;
            // Transform the name of the action into number
            switch(parsedData.action.name){
                case 'light':
                    console.log("light");
                    actionNumber = 1;
                    break;
                case 'water':
                    actionNumber = 2;
                    break;
                default:
                    error = true;
                    console.log("Error : Don't recognize the action");
            }
            // Transform the mode into number
            switch(parsedData.action.mode.name){
                case 'on':
                    modeNumber = 1;
                    break;
                case 'off':
                    modeNumber = 2;
                    break;
                case 'period':
                    modeNumber = 3;
                    timeNumber = parseInt(parsedData.action.mode.params.time, 10);                    
                    if(isNaN(timeNumber)){
                        console.log("Error : don't find the time parameter for the period mode");
                        error = true;
                    }
                    break;
                default:
                    error = true;
                    console.log("Dont recognize the mode");
            }
            // Format the code
            if(!error){
                console.log("Time = "+timeNumber+", Mode = "+modeNumber+", actionNumber = "+actionNumber);
                let codeToSent =  timeNumber*100 + modeNumber*10 + actionNumber ;                
                console.log("Code to sent : ", codeToSent);
		console.log("PlanteId : ",planteId);
	        const pythonProcess = spawn('python',["sendArd.py", codeToSent + "#", planteId]);
                // TODO : SENT THE codeToSent TO THE RIGTH planteId
            } else {
                console.log("Error : can't send the code because the command is not well formated");
            }

            client.complete(msg, printResultFor('completed'));
        });

        // If we receive an error, we print it
        client.on('error', function (err) {
            console.error(err.message);
        });

        // If we receive a disconnection message, we disconnect the client
        client.on('disconnect', function () {
            console.log("disconnection");
            clearInterval(sendInterval);
            client.removeAllListeners();
            client.connect(connectCallback);
        });
    }
}

// Open the connection
client.open(connectCallback);
