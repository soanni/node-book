var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs-extra');

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
//const FileStore = require('session-file-store')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var notes = require('./routes/notes');

var app = express();

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

//app.use(session({
// store: new FileStore({ path: "sessions"}),
// secret: 'keyboard mouse',
// resave: true,
// saveUninitialized: true
//}));
app.use(session({
 store: new RedisStore({
  host: "127.0.0.1",
  port: 6379
 }),
 secret: "keyboard mouse",
 resave: false,
 saveUninitialized: false
}));

users.initPassport(app);

app.use('/', index);
app.use('/users', users.router);
app.use('/notes', notes);

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
