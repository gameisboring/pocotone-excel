var express = require('express')
var router = express.Router()
require('dotenv').config()
const multer = require('multer')

router.use(express.json())
router.use(express.urlencoded({ extended: false }))

const SoundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.resourcesPath, '/public/sounds'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const ImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.resourcesPath, '/public/images'))
  },
  filename: function (req, file, cb) {
    cb(null, 'noti.png')
  },
})

router.get('/', function (req, res) {
  res.render('admin/index', { title: 'admin main', port: process.env.PORT })
})

router.get('/setting', function (req, res) {
  res.render('admin/setting', { title: 'admin setting' })
})

module.exports = router
