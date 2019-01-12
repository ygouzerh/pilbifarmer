//'use strict';


/*





function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

var lightPeriod=function lightPeriod(serviceClient, raspyId, planteId, time) {
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
};

var lighOn=function lightOn(serviceClient, raspyId, planteId) {
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
};

var lightOff=function lightOff(serviceClient, raspyId, planteId) {
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
};

// To test
var sendInterval = setInterval(function () {
  lightPeriod(serviceClient, targetDevice, "0", 12);
}, 3000);
*/


var test=function test(){
  console.log(conn);

};


module.exports.test=test;
/*
module.exports.lightPeriod=lightPeriod;
module.exports.lightOn=lightOn;
module.exports.lightOff=lightOff;

*/
