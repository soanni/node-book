#!/usr/bin/env node

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs-extra');

const passportSocketIo = require('passport.socketio');
const http = require('http');
const log = require('debug')('notes:server');
const error = require('debug')('notes:error');

const session = require('express-session');
//const RedisStore = require('connect-redis')(session);
const FileStore = require('session-file-store')(session);

const sessionCookie = 'notes.sid';
const sessionSecret = 'keyboard mouse';
const sessionStore = new FileStore({ path: process.env.NOTES_SESSIONS_DIR ? process.env.NOTES_SESSIONS_DIR : "sessions" });

var index = require('./routes/index');
var users = require('./routes/users');
var notes = require('./routes/notes');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
io.use(passportSocketIo.authorize({
 cookieParser: cookieParser,
 key: sessionCookie,
 secret: sessionSecret,
 store: sessionStore
}));

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var accessLogStream;
if (process.env.REQUEST_LOG_FILE){
 var logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
 fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
 accessLogStream = FileStreamRotator.getStream({
  filename: process.env.REQUEST_LOG_FILE,
  frequency: 'daily',
  verbose: false
 });
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
 stream: accessLogStream ? accessLogStream : process.stdout
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/bootstrap',express.static(path.join(__dirname, 'bower_components', 'bootstrap', 'dist')));
app.use('/vendor/jquery',express.static(path.join(__dirname, 'bower_components', 'jquery', 'dist')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
 store: sessionStore,
 secret: sessionSecret,
 key: sessionCookie,
 resave: true,
 saveUninitialized: true
}));
//app.use(session({
// store: new RedisStore({
//  host: "127.0.0.1",
//  port: 6379
// }),
// secret: "keyboard mouse",
// resave: false,
// saveUninitialized: false
//}));

users.initPassport(app);

app.use('/', index);
app.use('/users', users.router);
app.use('/notes', notes);

index.socketio(io);
notes.socketio(io);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
 var port = parseInt(val, 10);
 if(isNaN(port)){
  return val;
 }
 if(port >= 0){
  return port;
 }
 return false;
}

function onError(error){
 if(error.syscall !== 'listen'){
  throw error;
 }
 var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
 switch(error.code){
  case 'EACCES':
   console.error(bind + ' requires elevated priviliges');
   process.exit(1);
   break;
  case 'EADDRINUSE':
   console.error(bind + ' is already in use');
   process.exit(1);
   break;
  default:
   throw error;
 } 
}

function onListening() {
 var addr = server.address();
 var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
 log('Listening on ' + bind);
}
