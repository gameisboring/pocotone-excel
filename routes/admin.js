var express = require('express')
var router = express.Router()
require('dotenv').config()

router.get('/', function (req, res) {
  res.render('admin/index', { title: 'admin main', port: process.env.PORT })
})

router.get('/setting', function (req, res) {
  res.render('admin/setting', { title: 'admin setting' })
})

module.exports = router
