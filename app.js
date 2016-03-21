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

var sendEventData = {
    enabled: false,
    votingTime: 30
};
var sendEndEvent = false;
var eventCounter = 0;
var clients = 0;

var currentAnswers = {
    yes: 0,
    no: 0
};

function resetCurrentAnswers() {
    currentAnswers.yes = 0;
    currentAnswers.no = 0;
}


//get files

app.get('/index', function (req, res) {
    res.sendFile(path.join(__dirname, '/views', 'index.html'));
});

app.get('/game', function (req, res) {
    res.sendFile(path.join(__dirname, '/views', 'game.html'));
});

app.get('/data', function (req, res) {
    res.sendFile(path.join(__dirname, '/public', 'data.json'));
});

app.get('/client', function (req, res) {
    res.sendFile(path.join(__dirname, '/public', 'client.html'));
});

app.get('/dummy', function (req, res) {
    res.sendStatus(200);
});

app.get('/images', function (req, res) {
    var image = req.query.image;
    console.log("fetching image " + image);
    res.sendFile(path.join(__dirname, '/public/images/' + image + ".png"));
});

app.get('/videos', function (req, res) {
    var video = req.query.video;
    console.log("fetching video " + video);
    res.sendFile(path.join(__dirname, '/public/videos/' + video + ".mp4"));
});

app.post('/triggerVoting', function (req, res) {
    resetCurrentAnswers();
    console.log(req.body);
    var votingTime = parseInt(req.body['votingTime']);

    sendEventData.enabled = true;
    sendEventData.votingTime = votingTime || 10;
    eventCounter = parseInt(req.body['mediaCounter']);
    console.log("starting voting");
    //res.setHeader('Cache-Control','no-cache');

    setTimeout(function () {
        sendEventData.enabled = false;
        sendEndEvent = true;
        //console.log("voting time finished");
    }, (votingTime * 1000) + 3000);
    res.sendStatus(200);
});

var masterInterval;
app.get('/updates', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });
    clearInterval(masterInterval);
    masterInterval = setInterval(function () {
        if (sendEventData.enabled === true) {
            console.log("send data to index");
            res.write("event: vote\n");
            res.write("data: { \"answers\" : " + JSON.stringify(currentAnswers) + " }\n\n");
        }
        if (sendEndEvent === true) {
            console.log("end voting");
            sendEndEvent = false;
            res.write("event: end\n");
            res.write("data: {} \n\n");
        }
        if (sendEventData.enabled == false && sendEndEvent == false) {
            //console.log("sending ping event");
            res.write("event: ping\n");
            res.write("data: {}\n\n");
        }
    }, 3000);

});

////client functions
var executionCounter = 0;
app.get('/events', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });
    console.log('a client has connected');
    clients++;
    //is this needed as loop that everyone gets the message?
    setInterval(function () {
        //while voting is enabled.
        if (sendEventData.enabled === true) {
            //console.log('sending event');
            res.write("data: { \"eventNr\" : " + eventCounter + ", \"votingTime\":" + JSON.stringify(sendEventData.votingTime) + "}\n\n");
        }
    }, 1000);
});


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
        default:
            console.log("no valid answer");
            break;
    }
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
