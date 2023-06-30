var express = require('express')
var router = express.Router()
var path = require('path')
require('dotenv').config()
const fs = require('fs')

router.use(express.json())
router.use(express.urlencoded({ extended: false }))

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

router.post('/notification/setting', function (req, res) {
  console.log(req.body)
  if (req.body) {
    if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
      console.log(`please write file "APIconfig.json"`)
    } else {
      let setting = JSON.parse(
        fs.readFileSync(path.join('config', 'notiConfig.json'))
      )
      console.log(setting.BJID)
      setting.BJID[req.body.bj][req.body.plusMinus].push(req.body.keyWord)
      try {
        fs.writeFileSync(
          path.join('config', 'notiConfig.json'),
          JSON.stringify(setting)
        )
      } catch (error) {
        console.log(error)
      }
      res.status(200)
      res.json({ ok: true, data: req.body })
    }
  }
})

router.delete('/notification/setting', function (req, res) {
  if (req.body) {
    if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
      console.log(`please write file "APIconfig.json"`)
    } else {
      let setting = JSON.parse(
        fs.readFileSync(path.join('config', 'notiConfig.json'))
      )
      var data = req.body.data

      for (let i = 0; i < setting.BJID[data.bj][data.plusMinus].length; i++) {
        if (setting.BJID[data.bj][data.plusMinus][i] === data.keyWord) {
          setting.BJID[data.bj][data.plusMinus].splice(i, 1)
          i--
        }
      }

      try {
        fs.writeFileSync(
          path.join('config', 'notiConfig.json'),
          JSON.stringify(setting)
        )
      } catch (error) {
        console.log(error)
      }
      res.status(200)
      res.json({ ok: true, data: data })
    }
  }
})

module.exports = router
