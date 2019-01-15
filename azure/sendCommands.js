'use strict';

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

// Configuration file
var config = require('./config.json');

// Singleton to create a connexion to the iot hub
var serviceClient = (function (){
    var instance;

    function createInstance(){
        // The device-specific connection string to your Azure IoT Hub
        return Client.fromConnectionString(config.connectionString);
    }

    return {
        getInstance: function(){
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    }
})();

// Send a formatted payload to a raspberry
function sendCommand(raspyId, planteId, actionName, modeName, params) {
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
    console.log("SendCommand - will launch : ");
    console.log(payload)
    // TODO : OVERRIDE
    raspyId = 'MyNodeDevice'
    serviceClient.getInstance().send(raspyId, JSON.stringify(payload));
}

module.exports={
   sendCommand : sendCommand
};
