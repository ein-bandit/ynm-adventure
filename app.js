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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sendEvent = false;
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

app.get('/index', function(req, res) {
  res.sendFile(path.join(__dirname, '/views', 'index.html'));
});

app.get('/client', function(req, res) {
  res.sendFile(path.join(__dirname, '/public', 'client.html'));
});

app.get('/triggerVoting', function(req, res) {
  resetCurrentAnswers();
  sendEvent = true;
  //res.setHeader('Cache-Control','no-cache');
  res.sendStatus(200);
});

app.get('/events', function(req, res){
  res.writeHead(200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });

  console.log('a client has connected');

  setInterval(function(){
    console.log('writing');
    if(sendEvent === true) {
      console.log('sending event');
      res.write("data: { \"votingEnabled\": true }\n\n");
      sendEvent = false;
    }
  }, 5000);
});


app.post('/answer', function(req, res) {
  console.log(req.body.data);
  var answer = req.body.data;
  console.log('received answer: ' + answer);
  switch (answer) {
    case 0:
        currentAnswers.yes +=1;
          break;
    case 1:
      currentAnswers.no +=1;
          break;
    case 2:
      currentAnswers.maybe +=1;
          break;
  }
  res.sendStatus(200);

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
