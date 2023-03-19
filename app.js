'use strict';

require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const i18n = require('./lib/i18nConfigure.js');

const LoginController = require('./routes/loginController.js');

const register = require('./routes/apiv1/register');
// const jwtTokenAuth = require('./lib/jwtAuthMiddleware.js');

const { isAPI } = require('./lib/utils');
// const { header } = require('express-validator');
require('./models'); // Connect DB & register models

const cors = require('cors');

const app = express();

app.options('/apiv1/login', cors());
app.use(cors({ credentials: true, origin: true, optionsSuccessStatus: 200 }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Global Template variables
 */
app.locals.title = 'NodePop';

/**
 * Middlewares
 * Cada petición será evaluada por ellos
 */
/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(i18n.init);

/**
 * Website routes
 */

const loginController = new LoginController();

app.use('/', require('./routes/index'));
app.use('/anuncios', require('./routes/anuncios'));
app.use('/change-locale', require('./routes/change-locale.js'));

/* app.get('/login', loginController.index);
app.post('/login', loginController.post);
app.get('/logout', loginController.logout); */

/**
 * API v1 routes
 */
// Add Access Control Allow Origin headers

app.use('/apiv1/anuncios', /* jwtTokenAuth, */ require('./routes/apiv1/anuncios'));
app.use('/apiv1/login', loginController.JWTpost);
app.use('/apiv1/register', register);
app.use('/apiv1', express.static('public'));

/**
 * Error handlers
 */
// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err.array) {
    // validation error
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req)
      ? { message: 'not valid', errors: err.mapped() }
      : `not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  // establezco el status a la respuesta
  err.status = err.status || 500;
  res.status(err.status);

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err);

  // si es una petición al API respondo JSON:

  if (isAPI(req)) {
    res.json({ error: err.message });
    return;
  }

  // ...y si no respondo con HTML:

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.render('error');
});

module.exports = app;
