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

// USEFUL TOOLS

// Need this to execute a query without using res
function OutputStream(){
    return {
        buffer : "",
        write: function(value){
            this.buffer = this.buffer + value;
        },
        status: function(value){
            console.log("Status : "+value);
        },
        end: function(){
            console.log("This is the end");
        }
    }
}

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
    res.sendStatus(200);
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
    var body = req.body.auto;
    if(body === "on")
        var auto = 1
    else
        var auto = 0
    req.sql("UPDATE Mode SET automatique = " + auto + "where planteID = @id and action = @action")
    .param('id', req.params.id)
    .param('action',req.body.action)
    .into(res);
});

app.get('/commandes/plante/:planteID', function (req, res) {
    req.sql("SELECT * FROM Commande where planteID = @planteID for json path")
        .param("planteID", req.params.planteID)
        .into(res);
});

// Get commands per actions
app.get('/commandes/action/:planteID/:actionName', function (req, res) {
    req.sql("SELECT * FROM Commande where Commande LIKE @actionName and planteID = @planteID for json path")
        .param("planteID", req.params.planteID)
        .param("actionName", req.params.actionName)
        .into(res);
});


app.get('/commandes/perhours/:planteID/:interval', function (req, res) {    
    var instantDate = moment();
    var dateDebut = moment(instantDate).add(-req.params.interval, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    var dateFin = moment(instantDate).add(req.params.interval, 'seconds').format('YYYY-MM-DD HH:mm:ss');    
    req.sql("SELECT * FROM Commande where planteID = @planteID and @dateDebut < date_heure and date_heure < @dateFin and executed = 0 for json path")
        .param("planteID", req.params.planteID)
        .param("dateDebut", dateDebut)
        .param("dateFin", dateFin)
        .done(function(){
            req.sql("UPDATE Commande SET executed = 1 WHERE @dateDebut < date_heure and date_heure < @dateFin and planteID = @planteID")
            .param("planteID", req.params.planteID)
            .param("dateDebut", dateDebut)
            .param("dateFin", dateFin)
            .exec(res);
        })
        .into(res);
});

/**
 * Get the list of commands non-executed that need to be executed
 * in the range : date - interval -> date + interval
 * @param {int} interval Interval before / after the actual time
 */
function getCommandsPerInterval(interval){
    var instantDate = moment();
    var dateDebut = moment(instantDate).add(-interval, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    var dateFin = moment(instantDate).add(interval, 'seconds').format('YYYY-MM-DD HH:mm:ss');  
    let requester = tediousExpress(config.get('connection'));
    let commands = new OutputStream();
    console.log(dateDebut);
    console.log(dateFin);
    requester("select p.planteID as planteID, p.raspyID as raspyID, periode, commande as action "+
                "from Commande c inner join Plante p on c.planteID = p.planteID "+
                "inner join Mode m on m.planteID = p.planteID and m.action = c.commande "+
                "where @dateDebut < date_heure and date_heure < @dateFin and executed = 0 and m.automatique = 1 for json path")
        .param("dateDebut", dateDebut)
        .param("dateFin", dateFin)
        .done(function(){
            // Mark theses commands as executed.
            requester("UPDATE Commande SET executed = 1 WHERE @dateDebut < date_heure and date_heure < @dateFin")
            .param("dateDebut", dateDebut)
            .param("dateFin", dateFin)
            .exec(new OutputStream());
            executeCommands(commands.buffer);
        })
        .into(commands);
}

/**
 * Send the list of commands to the raspberry
 * @param {Array} commandsSQL Array of commands to execute now
 */
function executeCommands(commandsSQL){
    JSON.parse(commandsSQL).forEach(function(command){
        senderCommands.sendCommand(command.raspyID, command.planteID, command.action, 'period', {time: command.periode});
    });
}

/**
 * Insert automatized commands in the database
 */
app.post('/commandes/insert', function (req, res) {
    // Get the start date
    console.log(req.body.date_heure);
    let formatedTime = moment(req.body.date_heure).format('YYYY-MM-DD hh:mm:ss A');
    console.log("formatedTime");
    console.log(formatedTime);
    // Get the end time
    let dateFin = moment(req.body.date_heure).add(req.body.period, 'seconds').format('YYYY-MM-DD hh:mm:ss A');
    console.log(dateFin);
    // Use this to be able to execute sql query without using res
    let overlapsedCommands = new OutputStream();
    // Verify if we do not have overlapsed commands
    req.sql("SELECT * from Commande where planteID = @planteID and commande = @action and @dateDebut <= date_heure and date_heure <= @dateFin for json path")
        .done(function(){
            // If we don't have overlapsed commands, we could add the query
            if(( overlapsedCommands.buffer.length <= 2 )){
                console.log("We will execute it");
                req.sql("INSERT INTO Commande VALUES(@planteID, @date_heure, @period, @action, 0)")
                    .param("planteID", req.body.planteID)
                    .param("date_heure", formatedTime)
                    .param("period", req.body.period)
                    .param("action", req.body.action)
                    .into(new OutputStream());
                    res.send({result: "success"});
              } else {
                  console.log("Overlapsed commands found");
                  res.send({result: "error"});
              }
        })
        .param("planteID", req.body.planteID)
        .param("action", req.body.action)
        .param("dateDebut", formatedTime)
        .param("dateFin", dateFin)
        .into(overlapsedCommands);
});

app.post('/commandes/del/:id', function (req, res) {

    req.sql("DELETE FROM Commande WHERE ID = @id")
    .param('id', req.params.id).into(res);
});

// DISPLAY STATIC DATAS
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


// CRON TO GET AUTOMATIZED COMMANDS
cron.schedule('* */2 * * *', () => {
    console.log(new Date());
    getCommandsPerInterval(60);
});

