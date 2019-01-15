var express = require('express')
const basicAuth = require('express-basic-auth')
var senderCommands = require('./sendCommands')
var fs = require('fs')

// Create a server object
var app=express();

// AUTHENTIFICATION
app.use(basicAuth({
    users: { 'farmer': 'Plant360$' },
    challenge: true,
    realm: 'PilbiFarming',
    unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials rejected')
        : 'No credentials provided'
}

// ROUTING
app.get('*',function(req,res){
    let path = __dirname + '/public/' + req.url;
    fs.access(path, (err) => {
        if(!err) {
            res.sendFile(path);
        } else {
            res.sendFile(__dirname + '/public/index.html');
        }
    })
});

// API for the front-end form. Use it to send command to a raspberry
app.get('/sendCommand',function(req,res){
    console.log("We will send files")
    res.sendFile('index.html', { root: __dirname });
    senderCommands.sendCommand(req.query.rasp, req.query.planteId, req.query.action, req.query.mode, {time: req.query.time})
});

// LISTEN
app.listen(process.env.port || 3000)
