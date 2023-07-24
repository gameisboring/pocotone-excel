var express = require('express')
var router = express.Router()
require('dotenv').config()
const multer = require('multer')
var path = require('path')
const fs = require('fs')
const { getNewestList, getConfigFile } = require('../fileControl')
const { dateFormat } = require('../time')
const logger = require('../logger')

router.use(express.json())
router.use(express.urlencoded({ extended: false }))

var addr = process.env.NODE_ENV == 'production' ? 'nstream.kr' : 'localhost'

/**
 * 알림 사운드 수정
 */
const SoundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.bj == 'default') {
      cb(null, path.normalize('public/sounds'))
    } else {
      cb(null, path.normalize('public/sounds/' + req.body.bj))
      logger.info(
        `Rank Image File Write | Name ${
          file.originalname
        } , Addr : ${path.normalize('public/sounds/' + req.body.bj)}`
      )
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

/**
 * 알림 이미지 수정
 */
const ImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.normalize('public/images'))
    logger.info(
      `Rank Image File Write | Name ${
        file.originalname
      } , Addr : ${path.normalize('public/images')}`
    )
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

/**
 * 스코어보드 이미지 수정
 */
const BoardImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public/images/', req.body.category))
  },
  filename: function (req, file, cb) {
    cb(null, req.body.fileName)
    logger.info(
      `Rank Image File Write | Name ${req.body.fileName} , Addr : ${path.join(
        'public/images/',
        req.body.category
      )}`
    )
  },
})

/**
 * 랭킹 이미지 수정
 */
const RankImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.normalize('public/images/rank'))
  },
  filename: function (req, file, cb) {
    cb(null, req.body.fileName)
    logger.info(
      `Rank Image File Write | Name ${
        req.body.fileName
      } , Addr : ${path.normalize('public/images/rank')}`
    )
  },
})

const SoundUpload = multer({ storage: SoundStorage })
const ImageUpload = multer({ storage: ImageStorage })
const BoardSoundUpload = multer({ storage: BoardImageStorage })
const RankImageUpload = multer({ storage: RankImageStorage })

router.get('/', function (req, res) {
  logger.http('GET /admin')

  res.render('admin/index', {
    title: 'admin main',
    port: process.env.PORT,
    addr: addr,
  })
})

router.get('/setting', function (req, res) {
  logger.http('GET /admin/setting')
  res.render('admin/setting', {
    title: 'admin setting',
    port: process.env.PORT,
    addr: addr,
  })
})

router.post('/setting', function (req, res) {
  logger.http('POST /admin/setting')
  if (req.body) {
    let setting = getConfigFile()
    setting.BJSOUND = req.body
    try {
      fs.writeFileSync(
        path.join('config', 'notiConfig.json'),
        JSON.stringify(setting)
      )
    } catch (error) {
      logger.error(error)
    }
  }
  res.status(200)
  res.send({ ok: 'ok' })
})

router.post(
  '/setting/sound',
  SoundUpload.fields([{ name: 'file' }]),
  function (req, res) {
    logger.http('POST /admin/setting/sound')
    let setting = getConfigFile()

    if (req.body.bj && req.body.num) {
      // BJ
      if (!setting.BJSOUND[req.body.bj][req.body.num]) {
        // BJ NEW
        setting.BJSOUND[req.body.bj][req.body.num] = {
          UP: '',
          DOWN: '',
          FILE: '',
        }
        // 기존파일
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
        logger.error(error)
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
    logger.http('POST /admin/setting/image')
    let setting = getConfigFile()
    if (req.body.bj) {
      setting.BJIMG[req.body.bj] = `images/${req.files.file[0].originalname}`
    }

    try {
      fs.writeFileSync(
        path.join('config', 'notiConfig.json'),
        JSON.stringify(setting)
      )
    } catch (error) {
      logger.error(error)
    }

    res.status(200)
    res.send(req.files.file[0])
  }
)

router.post(
  '/board/image',
  BoardSoundUpload.fields([{ name: 'file' }]),
  function (req, res) {
    logger.http('POST /admin/board/image')
    res.json({ ok: true })
  }
)

router.post(
  '/rank/image',
  RankImageUpload.fields([{ name: 'file' }]),
  function (req, res) {
    logger.http('POST /admin/rank/image')
    res.json({ ok: true })
  }
)

router.post('/board/opacity', function (req, res) {
  logger.http('POST /admin/board/opacity')
  let setting = getConfigFile()

  setting.BOARD_OP = req.body.opacity

  try {
    fs.writeFileSync(
      path.join('config', 'notiConfig.json'),
      JSON.stringify(setting)
    )
  } catch (error) {
    logger.error(error)
  }
  res.json({ ok: true })
})

router.post('/rank/opacity', function (req, res) {
  logger.http('POST /admin/rank/opacity')
  let setting = getConfigFile()

  setting.RANK_OP = req.body.opacity

  try {
    fs.writeFileSync(
      path.join('config', 'notiConfig.json'),
      JSON.stringify(setting)
    )
  } catch (error) {
    logger.error(error)
  }
  res.json({ ok: true })
})

router.post('/rank/limit', function (req, res) {
  // logger.http('POST /rank/limit')
  let setting = getConfigFile()

  setting.RANK_LIMIT = req.body.limit

  try {
    fs.writeFileSync(
      path.join('config', 'notiConfig.json'),
      JSON.stringify(setting)
    )
  } catch (error) {
    logger.error(error)
  }
  res.json({ ok: true })
})

router.post('/script', function (req, res) {
  logger.http('POST /admin/script')
  let setting = getConfigFile()

  setting.script = req.body.script

  try {
    fs.writeFileSync(
      path.join('config', 'notiConfig.json'),
      JSON.stringify(setting)
    )
  } catch (error) {
    logger.error(error)
  }

  res.status(200)
  res.send({ ok: true })
})

router.get('/newlog', function (req, res) {
  let logList = JSON.parse(
    fs.readFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      'utf-8'
    )
  )
  res.send(logList)
})

router.post('/newlog', function (req, res) {
  logger.http('POST /admin/newlog')
  let logList = JSON.parse(
    fs.readFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      'utf-8'
    )
  )

  const newLog = new Object({
    isTest: false,
    createAt: dateFormat(new Date()),
    type: 'star',
    id: 'ADMIN',
    name: req.body.name,
    bj: req.body.bj ? req.body.bj : '',
    msg: req.body.msg,
    plusMinus: req.body.plusMinus ? req.body.plusMinus : '',
    value: req.body.value,
    number: logList.length + 1,
  })

  logList.push(newLog)

  try {
    fs.writeFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      JSON.stringify(logList)
    )
  } catch (error) {
    logger.error(error)
  }
  /*  [
  {
    "isTest": true,
    "createAt": "2023-07-06-00-52-52",
    "type": "star",
    "id": "afreehp",
    "name": "아프리카도우미",
    "value": "7",
    "msg": "꿍코톤",
    "keyword": "꿍코톤",
    "plusMinus": "plus",
    "imgUrl": "/images/ori.webp",
    "bj": "ori",
    "soundUrl": "ori/ori-second.WAV",
    "number": 1
  }
]
 */
  logger.info(
    `New Donation | 시청자ID: ADMIN, 닉네임: ${req.body.name}, 개수: ${req.body.value}, 메세지: ${req.body.msg}, 후원BJ :${req.body.bj}, 점수변동:${req.body.plusMinus}`
  )
  res.status(200)
  res.send({ ok: true, data: newLog })
})

router.delete('/newlog', function (req, res) {
  logger.http('DELETE /admin/newlog')
  let logList = JSON.parse(
    fs.readFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      'utf-8'
    )
  )

  const indexOfArrToDel = logList.findIndex(
    (item) => item.number === req.body.number
  )
  logList.splice(indexOfArrToDel, 1)

  try {
    fs.writeFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      JSON.stringify(logList)
    )
  } catch (error) {
    logger.error(error)
  }

  res.send({ ok: true, result: logList })
})

module.exports = router
