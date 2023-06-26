var express = require('express')
var router = express.Router()
var path = require('path')
require('dotenv').config()
const fs = require('fs')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Main Page' })
})

router.get('/notification', function (req, res) {
  res.render('notification', { title: 'Notification', port: process.env.PORT })
})

router.get('/board', function (req, res) {
  res.render('board', { title: 'Board', port: process.env.PORT })
})

router.get('/rank', function (req, res) {
  res.render('rank', { title: 'Rank', port: process.env.PORT })
})

router.get('/notification/setting', function (req, res) {
  if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
    console.log(`please write file "APIconfig.json"`)
  } else {
    res.send(
      JSON.parse(fs.readFileSync(path.join('config', 'notiConfig.json')))
    )
  }
})

module.exports = router
