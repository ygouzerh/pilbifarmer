'use strict';
// Define the objects you will be working with
var device = require('azure-iot-device');

// Define the client object that communicates with Azure IoT Hubs
var Client = require('azure-iot-device').Client;

// Define the message object that will define the message format going into Azure IoT Hubs
var Message = require('azure-iot-device').Message;

// Define the protocol that will be used to send messages to Azure IoT Hub
// For this lab we will use AMQP over Web Sockets. The usage of Web Sockets allows using
// AMQP also in environments where standard AMQP ports do not work (for example,
// because of network restrictions).
var Protocol = require('azure-iot-device-mqtt').Mqtt;

var config = require('./config.json');

// The device-specific connection string to your Azure IoT Hub
var connectionString = config.connectionString;

// Create the client instanxe that will manage the connection to your IoT Hub
// The client is created in the context of an Azure IoT device.
var client = Client.fromConnectionString(connectionString, Protocol);

// Extract the Azure IoT Hub device ID from the connection string
var deviceId = device.ConnectionString.parse(connectionString).DeviceId;

// *********************************************
// Helper function to print results in the console
// *********************************************
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// *********************************************
// Open the connection to Azure IoT Hub.
// When the connection respondes (either open or
// error) the anonymous function is executed.
// *********************************************
var connectCallback = function (err) {
    console.log('Open Azure IoT connection...');

    // *********************************************
    // If there is a connection error, display it
    // in the console.
    // *********************************************
    if(err) {
        console.error('...could not connect: ' + err);

    // *********************************************
    // If there is no error, send and receive
    // messages, and process completed messages.
    // *********************************************
    } else {
        console.log('...client connected');

        // *********************************************
        // Listen for incoming messages
        // *********************************************
        client.on('message', function (msg) {
            console.log('*********************************************');
            console.log('**** Message Received - Id: ' + msg.messageId + ' Body: ' + msg.data);
            console.log('*********************************************');
            console.log('Message : ');
            /*
                We receive this payload
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
			const spawn = require("child_process").spawn;
			const pythonProcess = spawn('python',["sendArd.py", msg.data]);
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
                // TODO : SENT THE codeToSent TO THE RIGTH planteId
            } else {
                console.log("Error : can't send the code because the command is not well formated");
            }

            // *********************************************
            // Process completed messages and remove them
            // from the message queue.
            // *********************************************
            client.complete(msg, printResultFor('completed'));
            // reject and abandon follow the same pattern.
            // /!\ reject and abandon are not available with MQTT
        });

        // *********************************************
        // If the client gets an error, dsiplay it in
        // the console.
        // *********************************************
        client.on('error', function (err) {
            console.error(err.message);
        });

        // *********************************************
        // If the client gets disconnected, cleanup and
        // reconnect.
        // *********************************************
        client.on('disconnect', function () {
            console.log("disconnection");
            clearInterval(sendInterval);
            client.removeAllListeners();
            client.connect(connectCallback);
        });
    }
}

// *********************************************
// Open the connection to Azure IoT Hubs and
// begin sending messages.
// *********************************************
client.open(connectCallback);
