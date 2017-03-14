var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var dashboard = require('./routes/dashboard');
var search = require('./routes/search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var db;

MongoClient.connect('mongodb://hritvik:hritvik@ds161039.mlab.com:61039/my-app-iitk', function(err, database) {
  if(err) return console.log(err);
  console.log("Connected correctly to database server");
  db  = database;
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use('/',dashboard);
app.use('/search', search);

app.post('/add_journey',function(req,res){
	db.collection('journey').save(req.body,function(err,result){
	if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
	});
});

app.post('/search_result',function(req,res){
  var query = {};
  if(req.body.from!=="false"){
    query.from = req.body.from;
  }
  if(req.body.to!=="false"){
    query.to = req.body.to;
  }
  if(req.body.date!==""){
    query.date = req.body.date;
  }
  db.collection('journey').find(query).toArray(function(err,result){
    if(err) return console.log(err);
    res.render('search_result.ejs',{output : result});
  });
});

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
