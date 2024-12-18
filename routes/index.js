var express = require('express')
var router = express.Router()
var path = require('path')
require('dotenv').config()
const fs = require('fs')
const { getNewestList, getConfigFile } = require('../fileControl')
const logger = require('../logger')

router.use(express.json())
router.use(express.urlencoded({ extended: false }))

var addr = process.env.NODE_ENV == 'production' ? 'nstream.kr' : 'localhost'
console.log(addr)

function urlCheck(param) {
  const { urlRand } = JSON.parse(
    fs.readFileSync(path.join('config', 'settings.json'))
  )
  console.log(`Key: ${urlRand} Param: ${param}`)
  if (urlRand != param || !param) {
    return res.redirect('/')
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  logger.http('GET /')
  if (req.headers.cookie != undefined) {
    res.redirect('/admin')
  }
  res.render('index', { title: 'mainPage' })
})

router.get('/board/data', function (req, res) {
  // logger.http('GET /board/data')
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

router.get('/board/img', function (req, res) {
  // logger.http('GET /board/img')
  var files = fs.readdirSync('public/images/board')
  res.send(files)
})

router.get('/rank/img', function (req, res) {
  // logger.http('GET /rank/data')
  var files = fs.readdirSync('public/images/rank')
  res.send(files)
})

router.get('/rank/data', function (req, res) {
  // logger.http('GET /rank/data')
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

  let setting = getConfigFile()
  res.json({ result: result, limit: setting.RANK_LIMIT })
})

router.get('/board/:rand', function (req, res) {
  logger.http('GET /board')
  console.log(req.params)
  urlCheck(req.params.rand)
  res.render('board', {
    title: 'Board',
    port: process.env.PORT,
    addr: addr,
  })
})

router.get('/rank/:rand', function (req, res) {
  logger.http('GET /rank')
  urlCheck(req.params.rand)
  res.render('rank', {
    title: 'Rank',
    port: process.env.PORT,
    addr: addr,
  })
})

router.get('/notification/:rand', function (req, res) {
  logger.http('GET /notification')
  urlCheck(req.params.rand)
  res.render('notification', {
    title: 'Notification',
    port: process.env.PORT,
    addr: addr,
  })
})

router.get('/ladder/:rand', function (req, res) {
  logger.http('GET /ladder')
  if (!req.params) {
    console.log('ee')
  }
  urlCheck(req.params.rand)
  res.render('ladder', { title: 'Main Page' })
})

module.exports = router
