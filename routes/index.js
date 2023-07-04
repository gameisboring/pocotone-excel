var express = require('express')
var router = express.Router()
var path = require('path')
require('dotenv').config()
const fs = require('fs')
const { getNewestList } = require('../fileControl')

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
    console.log(`please write file "notiConfig.json"`)
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
      console.log(`please write file "notiConfig.json"`)
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
      console.log(`please write file "notiConfig.json"`)
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

router.get('/board/data', function (req, res) {
  let scoreResult = {
    dal: { score: 0, contribute: 0, BJ: '달체솜' },
    yam: { score: 0, contribute: 0, BJ: '얌' },
    ori: { score: 0, contribute: 0, BJ: '오리꿍' },
    hiyoko: { score: 0, contribute: 0, BJ: '히요코' },
  }
  let result = new Array()

  let orderedList = JSON.parse(
    fs.readFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      'utf-8'
    )
  )

  orderedList.forEach((order) => {
    if (order.bj || order.plusMinus) {
      if (order.plusMinus == 'plus') {
        scoreResult[order.bj].score += Number(order.value)
      } else if (order.plusMinus == 'minus') {
        scoreResult[order.bj].score -= Number(order.value)
      }
      scoreResult[order.bj].contribute += Number(order.value)
    }
  })

  Object.keys(scoreResult).forEach((bj) => {
    result.push(scoreResult[bj])
  })

  result.sort(function (a, b) {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })

  for (var i in result) {
    if (result[i].contribute == 0) {
      result[i].rank = '#'
    } else {
      result[i].rank = ++i
    }
  }

  res.send(result)
})

router.get('/rank/data', function (req, res) {
  let result = new Array()
  let donationScore = new Object({})

  let orderedList = JSON.parse(
    fs.readFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      'utf-8'
    )
  )

  orderedList.forEach((order) => {
    if (!donationScore.hasOwnProperty(order.name)) {
      donationScore[order.name] = 0
    }
    donationScore[order.name] += Number(order.value)
  })

  Object.keys(donationScore).forEach((donator) => {
    result.push({ donator: donator, quantity: donationScore[donator] })
  })

  result.sort(function (a, b) {
    if (a.quantity > b.quantity) return -1
    if (a.quantity < b.quantity) return 1
    return 0
  })

  for (var i in result) {
    result[i].rank = ++i
  }

  res.send(result)
})

module.exports = router
