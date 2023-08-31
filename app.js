var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
require('dotenv').config()
// const basicAuth = require('express-basic-auth')
const { cookieJwtAuth } = require('./cookieJwtAuth')
const setUpLoginRoute = require('./routes/login')
const logger = require('./logger')
const bodyParser = require('body-parser')

var indexRouter = require('./routes/index')
var adminRouter = require('./routes/admin')
var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'config')))
app.disable('x-powered-by')

// app.use(
//   basicAuth({
//     users: { admin: 'supersecret' },
//     challenge: true,
//   })
// )
/* GET home page. */
app.get('/', function (req, res, next) {
  logger.http('GET /')
  if (req.headers.cookie != undefined) {
    res.redirect('/admin')
  }
  res.render('index', { title: 'mainPage' })
})

setUpLoginRoute.login(app)

app.use(cookieJwtAuth)
app.use('/', indexRouter)
app.use('/admin', adminRouter)

app.use(function (err, req, res, next) {
  if (401 == err.status) {
    res.redirect('/')
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
