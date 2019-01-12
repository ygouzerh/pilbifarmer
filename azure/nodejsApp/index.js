var express = require('express')
var comJs = require('./SendCommands')
//create a server object

var app=express();
//importation des biblio azure iot hub

//var Client = require('azure-iothub').Client;
//var Message = require('azure-iot-common').Message;

//-------------------------------------------------------------------------

//importation de biblio qui contient la chaine de connectionString
var config = require('./config.json');

console.log(config.connectionString);

//-------------------------------------------------------------------------

// The device-specific connection string to your Azure IoT Hub
//var connectionString = config.connectionString;

//-------------------------------------------------------------------------

// Need to be override
//var targetDevice = 'MyNodeDevice';

//-------------------------------------------------------------------------

//connection avec iot Hub
//var serviceClient = Client.fromConnectionString(connectionString);

//-------------------------------------------------------------------------


app.get('/',function(req,res){

res.sendFile(__dirname+'/index.html');

});

app.get('/SendCommand',function(req,res){

res.sendFile(__dirname+'/index.html');

// Execution d'action selon son type

console.log(req.query.rasp);

if(req.query.action=='Lumiere'){

  if(req.query.mode=='On'){

        if(req.query.time==''){

          //comJs.lightPeriod(serviceClient,req.query.rasp,req.query.planteId,req.query.time);
        }
        //comJs.test()
        else if (req.query.time=='') {

          //comJs.lightOn(serviceClient,req.query.rasp,req.query.planteId);

        }
  }
  else if (req.query.mode=='Off') {

        //comJs.lightOff(serviceClient,req.query.rasp,req.query.planteId);

  }



}


});

app.listen(process.env.port || 3000)
