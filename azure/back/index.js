var express = require('express')
const basicAuth = require('express-basic-auth')
var senderCommands = require('./sendCommands')
var fs = require('fs')
var config = require('config')
var tediousExpress = require('express4-tedious');
var bodyParser = require('body-parser');
var cors = require('cors');

const moment = require('moment');
// Create a server object
var app=express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cors({origin: '*'}));
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

// API FOR THE FRONT-END
// Use it to send command to a raspberry
app.get('/sendCommand',function(req,res){
    console.log("We will send files")
    res.sendFile('index.html', { root: __dirname });
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

app.get('/commandes/perhours/:planteID', function (req, res) {

    console.log("Zbra");
    var interval = 5;
    var instantDate = new Date(Date.now());
    var dateDebut = new Date(instantDate.getTime() - interval*60000).toISOString();
    var dateFin = new Date(instantDate.getTime() + interval*60000).toISOString();
    console.log(instantDate);
    console.log(dateDebut);
    console.log(dateFin);
    req.sql("SELECT * FROM Commande where @dateDebut < date_heure and date_heure < @dateFin and planteID = @planteID")
        .param("dateDebut", dateDebut)
        .param("dateFin", dateFin)
        .param("planteID", req.params.planteID)
        .into(res);
});

app.get('/commandes/insert', function (req, res) {
    // TODO : Debug
    // VALUES PRE STORED
    req.query.planteID = 'plante3';
    let dateToday = moment(new Date()).format('YYYY-MM-DD hh:mm');
    console.log(dateToday);
    req.query.period = 15;
    req.query.command = 'Arrosage';
    req.sql("INSERT INTO Commande VALUES(@planteID, @date_heure, @period, @command, 1)")
        .param("planteID", req.query.planteID)
        .param("date_heure", dateToday)
        .param("period", req.query.period)
        .param("command", req.query.command)
        .into(res);
    res.sendFile(__dirname + '/public/index.html');
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

// LISTEN
app.listen(process.env.port || 3000)
