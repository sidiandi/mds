var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const MdContent = require('./app/mdContentGit');
const MdRender = require('./app/mdRender');

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

const content = new MdContent('C:\\work\\mds-test-content', (err) =>{
  const renderer = new MdRender();
  app.use('/api', new require('./routes/api')(content, renderer));
  app.use('/source', new require('./routes/source')(content));
  app.use('/render', new require('./routes/render')(content, renderer));
  app.use('/nav', new require('./routes/nav')(content, renderer));
  app.use('/breadCrumbs', new require('./routes/breadCrumbs')(content, renderer));
  app.use('/history', new require('./routes/history')(content, renderer));
  //app.static('/', './public');

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
});

module.exports = app;
