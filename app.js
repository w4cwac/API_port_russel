var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const path = require('path');

var indexRouter = require('./routes/index');
const mongodb = require('./db/mongo');

mongodb.initClientDbConnection();

var app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public'));

app.use(cors({
    exposedHeaders: ['Authorization'],
    origin: "*"
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res, next) {
    res.render('index', { title: 'Port de Russell' });
  });

app.use('/', indexRouter);

app.use('/docs', express.static(path.join(__dirname, 'docs')));

app.use(function(req, res, next) {
    res.status(404).json({name:'API', version: '1.0', status: 404, message: 'not_found'});
});

module.exports = app;
