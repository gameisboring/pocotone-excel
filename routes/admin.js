var express = require('express')
var router = express.Router()
require('dotenv').config()
const multer = require('multer')
var path = require('path')
const fs = require('fs')

router.use(express.json())
router.use(express.urlencoded({ extended: false }))

const SoundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.bj == 'default') {
      cb(null, path.normalize('public/sounds'))
    } else {
      cb(null, path.normalize('public/sounds/' + req.body.bj))
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const ImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.normalize('public/images'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const SoundUpload = multer({ storage: SoundStorage })
const ImageUpload = multer({ storage: ImageStorage })

router.get('/', function (req, res) {
  res.render('admin/index', { title: 'admin main', port: process.env.PORT })
})

router.get('/setting', function (req, res) {
  res.render('admin/setting', {
    title: 'admin setting',
    port: process.env.PORT,
  })
})

router.post('/setting', function (req, res) {
  if (req.body) {
    if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
      console.log(`please write file "notiConfig.json"`)
    } else {
      let setting = JSON.parse(
        fs.readFileSync(path.join('config', 'notiConfig.json'))
      )
      setting.BJSOUND = req.body
      try {
        fs.writeFileSync(
          path.join('config', 'notiConfig.json'),
          JSON.stringify(setting)
        )
      } catch (error) {
        console.log(error)
      }
    }
    res.status(200)
    res.send({ ok: 'ok' })
  }
})

router.post(
  '/setting/sound',
  SoundUpload.fields([{ name: 'file' }]),
  function (req, res) {
    if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
      console.log(`please write file "notiConfig.json"`)
    } else {
      let setting = JSON.parse(
        fs.readFileSync(path.join('config', 'notiConfig.json'))
      )
      if (req.body.bj && req.body.num) {
        // BJ
        if (!setting.BJSOUND[req.body.bj][req.body.num]) {
          // BJ NEW
          setting.BJSOUND[req.body.bj][req.body.num] = {
            UP: '',
            DOWN: '',
            FILE: '',
          }
        }
        // 기존파일
        // console.log(setting.BJSOUND[req.body.bj][req.body.num].FILE)
        setting.BJSOUND[req.body.bj][req.body.num].FILE =
          req.files.file[0].originalname
      } else if (req.body.bj && !req.body.num) {
        // DEFAULT
        setting.BJSOUND[req.body.bj] = req.files.file[0].originalname
      }

      try {
        fs.writeFileSync(
          path.join('config', 'notiConfig.json'),
          JSON.stringify(setting)
        )
      } catch (error) {
        console.log(error)
      }
    }

    res.status(200)
    res.send(req.files.file[0])
  }
)

router.post(
  '/setting/image',
  ImageUpload.fields([{ name: 'file' }]),
  function (req, res) {
    if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
      console.log(`please write file "notiConfig.json"`)
    } else {
      let setting = JSON.parse(
        fs.readFileSync(path.join('config', 'notiConfig.json'))
      )
      if (req.body.bj) {
        setting.BJIMG[req.body.bj] = `images/${req.files.file[0].originalname}`
      }

      try {
        fs.writeFileSync(
          path.join('config', 'notiConfig.json'),
          JSON.stringify(setting)
        )
      } catch (error) {
        console.log(error)
      }
    }

    res.status(200)
    res.send(req.files.file[0])
  }
)

module.exports = router
