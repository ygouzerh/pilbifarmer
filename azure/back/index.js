var express = require('express')
const basicAuth = require('express-basic-auth')
var senderCommands = require('./sendCommands')
var fs = require('fs')
var config = require('config')
var tediousExpress = require('express4-tedious');
var bodyParser = require('body-parser');

// Create a server object
var app=express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
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

app.use(function (req, res, next) {
    req.sql = tediousExpress(config.get('connection'));
    next();
});
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

app.get('/plantes', function (req, res) {

    req.sql("SELECT * FROM Plante for json path")
        .into(res);

});

app.get('/modes', function (req, res) {

    req.sql("SELECT * FROM Mode for json path")
        .into(res);

});

app.get('/modes/:id', function (req, res) {

    req.sql("SELECT * FROM Mode where planteID = @id for json path, without_array_wrapper")
    .param('id', req.params.id)
    .into(res, '{}');
});

app.post('/modes/:id', function (req, res) {
    var body = req.body.state;
    if(body === "on")
        var state = 1
    else
        var state = 0
    console.log(state)
    req.sql("UPDATE Mode SET automatique = " + state + "where planteID = @id")
    .param('id', req.params.id).into(res);


});

// LISTEN
app.listen(process.env.port || 3000)
