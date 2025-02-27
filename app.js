#!/usr/bin/env node

require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var compression = require('compression')


var config = {};
try {
  config = require('./config.json');
} catch(e) {
  if (e.code == 'MODULE_NOT_FOUND') {
    console.log('No config file found. Using default configuration... (config.example.json)');
    config = require('./config.example.json');
  } else {
    throw e;
    process.exit(1);
  }
}

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 86400000,
  setHeaders: function(res, path) {
      res.setHeader("Expires", new Date(Date.now() + 2592000000*30).toUTCString());
    }
}));

// app libraries
global.__lib = __dirname + '/lib/';


// client

app.get('/', function(req, res) {
  res.render('index', config);
});

app.get('/config', function(req, res) {
  res.json(config.settings);
});

require('./routes')(app);

// let angular catch them
app.use(function(req, res) {
  res.render('index', config);
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

var http = require('http').Server(app);
//var io = require('socket.io')(http);

// web3socket(io);
console.log("ighererererer");
http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
var RESPONSE = require('./helpers/RESPONSE.js');
console.log("-----------igherereererer");

// var axios = require('axios');
// // axios.get(`${process.env.APP_URL}/masternode/test`);
// axios.get(`http://localhost:3000/masternode/updatemndetails`);


// function startWatch() {
//     const masterNodeHelper = require('./helpers/masterNodeHelper');
//     masterNodeHelper.startWatch();
//     masterNodeHelper.startEpochWatch();
// }

// startWatch();