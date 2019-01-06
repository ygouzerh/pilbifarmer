'use strict';

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

var config = require('./config.json');

// The device-specific connection string to your Azure IoT Hub
var connectionString = config.connectionString;

// Need to be override
var targetDevice = 'MyNodeDevice';

var serviceClient = Client.fromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

function lightPeriod(serviceClient, raspyId, planteId, time) {
  var payload = JSON.stringify({
          planteId: planteId,
          action: {
            name: "light",
            params: {
              mode: "period",
              time: 10
            }
          }
  });
  serviceClient.send(raspyId, payload);
}

function lightOn(serviceClient, raspyId, planteId) {
  var payload = JSON.stringify({
          planteId: planteId,
          action: {
            name: "light",
            params: {
              mode: "on",
            }
          }
  });
  serviceClient.send(raspyId, payload);
}

function lightOff(serviceClient, raspyId, planteId) {
  var payload = JSON.stringify({
          planteId: planteId,
          action: {
            name: "light",
            params: {
              mode: "off",
            }
          }
  });
  serviceClient.send(raspyId, payload);
}

// To test
var sendInterval = setInterval(function () {
  lightPeriod(serviceClient, targetDevice, "0", 12);
}, 3000);
