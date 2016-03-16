var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sendEvent = false;
var eventCounter = 0;
var clients = 0;
var countdown = false;
var counter = 0;
var usersVoted = [];
var nextMedia = true;
var mediaCounter = 0;

var mediaLinks = [];

var currentAnswers = {
    yes: 0,
    no: 0,
    maybe: 0
};

function resetCurrentAnswers() {
    currentAnswers.yes = 0;
    currentAnswers.no = 0;
    currentAnswers.maybe = 0;
}


//get files

app.get('/index', function (req, res) {
    res.sendFile(path.join(__dirname, '/views', 'index.html'));
});

app.get('/disconnect', function (req, res) {
    clients--;
    res.sendStatus(200);
});
app.get('/client', function (req, res) {
    res.sendFile(path.join(__dirname, '/public', 'client.html'));
});

app.get('/triggerVoting', function (req, res) {
    resetCurrentAnswers();
    usersVoted = [];
    sendEvent = true;
    countdown = true;
    eventCounter += 1;
    //res.setHeader('Cache-Control','no-cache');
    res.sendStatus(200);
});


app.get('/updates', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });

    setInterval(function () {
        //console.log('writing to index');
        if (nextMedia === true) {
            res.write("data: { \"nextMedia\" : \"" +mediaLinks[mediaCounter]+ "\"}");
            mediaCounter++;
            nextMedia = false;
        }
        res.write("data: { \"clients\" : " + clients + ", \"answers\" : " + JSON.stringify(currentAnswers) + " }\n\n");
    }, 5000);
});

////client functions
var executionCounter = 0;
app.get('/events', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });
    //console.log('a client has connected');
    clients += 1;
    setInterval(function () {
        //while voting is enabled.
        if (sendEvent === true) {
            //console.log('sending event');
            res.write("data: { \"votingEnabled\": true, \"eventNr\" : " + eventCounter + "}\n\n");
            usersVoted.push();
        }
    }, 5000);
});

setInterval(function () {
    if (countdown === true && counter > 0) {
        counter--;
        if (counter == 0) {
            sendEvent = false;
            nextMedia = true;
        }
    }
}, 1000);


app.post('/answer', function (req, res) {
    console.log(req.body.data);
    var answer = req.body.data;
    //console.log('received answer: ' + answer);
    switch (parseInt(answer)) {
        case 0:
            currentAnswers.yes += 1;
            break;
        case 1:
            currentAnswers.no += 1;
            break;
        case 2:
            currentAnswers.maybe += 1;
            break;
        default:
            console.log("no valid answer");
            break;
    }
    //console.log(currentAnswers);
    //data (with answers) is written periodically to index.
    res.sendStatus(200);
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
