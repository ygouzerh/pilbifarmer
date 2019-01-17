var express = require('express')
const basicAuth = require('express-basic-auth')
var senderCommands = require('./sendCommands')
var fs = require('fs')
var config = require('config')
var tediousExpress = require('express4-tedious');
var bodyParser = require('body-parser');
var cors = require('cors');
const moment = require('moment');
var request = require('request');
var cron = require('node-cron');

// Create a server object
var app=express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cors({origin: '*'}));

// AUTHENTIFICATION
var mdp = 'Plant360$';
app.use(basicAuth({
    users: { 'farmer': mdp },
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

// API FOR THE FRONT-END
// Use it to send command to a raspberry
// API for the front-end form. Use it to send command to a raspberry
app.get('/sendCommand',function(req,res){
    senderCommands.sendCommand(req.query.rasp, req.query.planteId, req.query.action, req.query.mode, {time: req.query.time})
});

app.get('/raspy', function (req, res) {

    req.sql("SELECT DISTINCT raspyID FROM Plante for json path")
        .into(res);

});

app.get('/plantes', function (req, res) {

    req.sql("SELECT * FROM Plante for json path")
        .into(res);

});

app.get('/plantes/:raspyID', function (req, res) {

    req.sql("SELECT * FROM Plante where raspyID = @raspyID for json path")
        .param('raspyID', req.params.raspyID)
        .into(res);

});

app.get('/modes', function (req, res) {

    req.sql("SELECT * FROM Mode for json path")
        .into(res);

});

app.get('/modes/:id', function (req, res) {
    req.sql("SELECT * FROM Mode where planteID = @id for json path")
    .param('id', req.params.id)
    .into(res);
});

app.post('/modes/:id', function (req, res) {
    var body = req.body.state;
    if(body === "on")
        var state = 1
    else
        var state = 0
    req.sql("UPDATE Mode SET automatique = " + state + "where planteID = @id and arrosage = " + req.body.arrosage)
    .param('id', req.params.id).into(res);
});

app.get('/commandes/plante/:planteID', function (req, res) {
    req.sql("SELECT * FROM Commande where planteID = @planteID")
        .param("planteID", req.params.planteID)
        .into(res);
});

app.get('/commandes/perhours/:planteID/:interval', function (req, res) {    
    var instantDate = moment();
    var dateDebut = moment(instantDate).add(-req.params.interval, 'seconds').format('YYYY-MM-DD hh:mm A');
    var dateFin = moment(instantDate).add(req.params.interval, 'seconds').format('YYYY-MM-DD hh:mm A');    
    req.sql("SELECT * FROM Commande where @dateDebut < date_heure and date_heure < @dateFin and planteID = @planteID for json path")
        .param("dateDebut", dateDebut)
        .param("dateFin", dateFin)
        .param("planteID", req.params.planteID)
        .into(res);
});

app.post('/commandes/insert', function (req, res) {
    let formatedTime = moment(req.body.datetime).format('YYYY-MM-DD hh:mm A');
    req.sql("INSERT INTO Commande VALUES(@planteID, @date_heure, @period, @action, 0)")
        .param("planteID", req.body.planteID)
        .param("date_heure", formatedTime)
        .param("period", req.body.period)
        .param("action", req.body.action)
        .into(res);
});

// AFFICHAGES DES DONNEES STATIQUES
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

// TODO
// select planteID, select good interval, verify hostname, sendCommand
function getCommands(planteID, interval){
    console.log("COMMAND : ");
    request('http://farmer:'+mdp+'@localhost:3000/commandes/perhours/'+planteID+'/'+interval, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var msg = JSON.parse(body);
            console.log(msg);
        }
    })
}

// LISTEN
app.listen(process.env.port || 3000)

// CRON
cron.schedule('*/5 * * * * *', () => {
    getCommands('plante1', 1200);
});

