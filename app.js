var createError = require('http-errors');
const dotenv = require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require("mongoose");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('runValidators', true);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
  console.log("Well done! , connected with mongoDB database");
}).on('error', error => {
  console.log("Oops! database connection error:" + error);
});

const userpaths = [
  { pathUrl: '/signUp', routeFile: 'signUp' },
  { pathUrl: '/signIn', routeFile: 'signIn'},
  { pathUrl: '/signOut', routeFile: 'signOut'},
];

userpaths.forEach((path) => {
	app.use('/users'+path.pathUrl, require('./routes/users/' + path.routeFile));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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