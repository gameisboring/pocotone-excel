const util = require('util')

const io = require('socket.io-client')
const request = require('request')
const requestPromise = util.promisify(request)
const fs = require('fs')
var path = require('path')
const { dateFormat } = require('./time')
const { getNewestList, getConfigFile } = require('./fileControl')
const logger = require('./logger')
const WebSocket = require('ws')
Number.prototype.padLeft = function (e, t) {
  return Array(e - String(this).length + 1).join(t || '0') + this
}

module.exports = async (server) => {
  const SocketIO = require('socket.io')(server, { path: '/socket.io' })
  //////////////////////////////////////////////////////////////////
  /// settings, alertbox url
  //////////////////////////////////////////////////////////////////
  var settings = JSON.parse(
    fs.readFileSync(path.join('config', 'settings.json'))
  )
  //////////////////////////////////////////////////////////////////
  /// afreehp
  //////////////////////////////////////////////////////////////////
  logger.info('==============================================')
  logger.info('Initialize afreehp')

  async function connect_afreehp() {
    require('./fileControl').makeListFile()

    settings = await checkAfreeHpIdx(
      JSON.parse(fs.readFileSync(path.join('config', 'settings.json')))
    )

    const url_ws_afreehp = 'ws://110.10.76.66:8060/Websocket'
    /*const _socketAfreehp = new WebSocket(
      'ws://' + '110.10.76.66' + ':' + '8060' + '/Websocket',
      'chat'
    )
    _socketAfreehp.binaryType = 'arraybuffer'

    _socketAfreehp.onopen = function (e) {
      console.log('eee')
      var chatToken =
        '.A32.7bbT56vyHM9fKZk.2RbqkdaE1VyAJcvr8zFej3vpzYaJz25rQWshCTIHWpclpMgtu1YdWRAf_dZBJ_KGibfDyKbcsX7RvlW2e7wxsWmb6PYx9mJCOXQimWf5f6Ffv4fcRWGfhum4Lzni2Ejan30-Lsbch4qMXBGw8QzuhHJHdpQPQUDfcAZWczivJiwuBo-sbf6plicuXo3yCleQAV078YbPw3xMEjZg-URn8cy_H55jwNno61ZqS0kAPoBTfGsJX_bKGcLiofmnS_7vcJQIBx2gAEga90lLKrdQj8fFazZZm6KTJKmtC5RzubB9MSiZ9vEdmH3ipMLK4n2ibtqhL_hGd4aBlqvjSQgUnZtBa6S1qF1UW05LM1mcCgVxMuAX0FjSzNrKrN-1TbiN9ZTel_FKWBki7dooY-U4zCFsf_QQECZKoxv9usnyic8U6AvVSBsu4NkrGpeaW3CN8odLNROGWqvlPkc2kivCx-JqPK82IkMzhVGrpNh6mGWh8OmqBFrcV7YHp4LH_9_OIC213vXCXGudZuIOTBMzZS0D3V_VjnI4CIQ_fSfyTjU'
      _socketAfreehp.send(afreeca.login(chatToken, '', 4))
      _socketAfreehp.send(afreeca.joinch())
    }

    _socketAfreehp.onmessage = function (e) {
      var t = null
      e.data instanceof ArrayBuffer
        ? ((t = e.data), afreeca.parseMessage(t, _socketAfreehp))
        : (t = afreeca.readBuffer(e.data, _socketAfreehp))
      console.log(t)
    }
 */
    const socketAfreehp = io(url_ws_afreehp, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 10000,
      autoConnect: false,
    })

    // to get all packet
    var onevent = socketAfreehp.onevent
    socketAfreehp.onevent = function (packet) {
      var args = packet.data || []
      onevent.call(this, packet) // original call
      packet.data = ['*'].concat(args)
      onevent.call(this, packet) // additional call to catch-all
    }

    var page = {
      idx: settings.afreehp.idx,
      // pagelist: [{pageid: "alert", subpage: "0"}],
      // platform: {twitch: "twitch_channel_id", youtube: "youtube_channel_unique_code"}
    }

    // all events
    socketAfreehp.on('*', function (event, data) {
      console.log('all events')
      console.log('event type = ', event)
      doSomething(data)
    })

    socketAfreehp.on('connect', () => {
      socketAfreehp.emit('page', page)
      console.log('connect')
      console.log(page)
      // socket.send("pagecmd", pagecmd);
    })

    /* socketAfreehp.on('cmd', async (data) => {
      var config = getConfigFile()
      try {
        if (
          data.data !== undefined &&
          data.data.value !== undefined &&
          data.data.type !== undefined
        ) {
          var val = data.data.value
          var type = data.data.type
          var id = data.data.id
          var name = data.data.name
          var { keyword, plusMinus, imgUrl, BJ } = getImgUrlFromMsg(
            config,
            data.data
          )

          var soundUrl = await getSoundSrc(config.BJSOUND, data.data.value, BJ)

          if (data.data.broad == 'afreeca' && type == 'star') {
            logger.info(
              `New Donation | 타입: ${type}, 시청자 ID:${id}, 시청자 이름:${name}, 개수:${val}, 메세지:${
                data.data.msg
              }, 후원 BJ:${BJ ? BJ : '없음'}, 점수변동:${
                plusMinus ? plusMinus : '없음'
              }, 키워드:${
                keyword ? keyword : '없음'
              }, IMG:${imgUrl}, SOUND:${soundUrl}`
            )
            notiData = {
              isTest: data.type == 'testmsg' ? true : false,
              createAt: dateFormat(new Date()),
              type: type,
              id: id,
              name: name,
              value: val,
              msg: data.data.msg,
              keyword: keyword,
              plusMinus: plusMinus,
              imgUrl: imgUrl,
              bj: BJ,
              soundUrl: soundUrl,
            }
            inputListDonationData(notiData)
            notiData.config = config
            SocketIO.emit('news', notiData)
          }
        }
      } catch (e) {
        logger.error('Afreehp message parse error: ', e.toString())
      }
    }) */

    /*     socketAfreehp.on('error', () => {
      logger.error('Afreehp error')
    }) */

    /*     socketAfreehp.on('close', () => {
      logger.info('Afreehp close')
    }) */

    /*     socketAfreehp.on('connect_error', (err) => {
      logger.error('Afreehp connect_error')
      logger.error(err)
    }) */

    setTimeout(() => {
      socketAfreehp.connect()
    }, 1000)
  }

  SocketIO.on('connection', (socket) => {
    socket.emit('afreecaHpUrl', settings.afreehp.alertbox_url)
    socket.emit('roulette_default', '오리꿍,얌,달체솜,히요코')
    socket.on('reply', (msg) => {
      logger.info(msg)
    })
    socket.on('stop', (msg) => {
      logger.info(msg)
      SocketIO.emit('stop', 'stop button click')
    })

    socket.on('resume', (msg) => {
      logger.info(msg)
      SocketIO.emit('resume', 'resume button click')
    })

    socket.on('urlSetting', async (msg) => {
      logger.info('urlSetting : afreeca helper url : ' + msg)
      /* {"afreehp":{"use":true,"alertbox_url":"http://afreehp.kr/page/VZWWnKaZx8bYmqSVwJY"}} */
      var newSetting = JSON.parse(
        fs.readFileSync(path.join('config', 'settings.json'))
      )
      newSetting.afreehp.alertbox_url = msg
      delete newSetting.afreehp.idx
      newSetting = await checkAfreeHpIdx(newSetting)
      if (typeof newSetting == 'object') {
        fs.writeFileSync(
          path.join('config', 'settings.json'),
          JSON.stringify(newSetting)
        )
        socket.emit('urlChange', { ok: true, data: msg })
        process.exit(1)
      } else {
        socket.emit('urlChange', { ok: false })
      }
    })

    socket.on('restart', async (msg) => {
      logger.info(msg)
      process.exit(1)
    })
  })

  function getImgUrlFromMsg(notiConfig, data) {
    let BJID = Object.keys(notiConfig.BJID)
    let filteredWord = []
    let filteredBjImgUrl = []

    let keyword = ''
    let plusMinus = ''
    let BJ = ''
    let imgUrl = notiConfig.BJIMG.default

    for (i in BJID) {
      // bJID[0] == 'ori'
      Object.keys(notiConfig.BJID[BJID[i]]).forEach((plma) => {
        notiConfig.BJID[BJID[i]][plma].forEach((_keyword) => {
          var searchResult = String(data.msg).search(_keyword)
          // if
          if (searchResult != -1) {
            filteredWord.push([_keyword, plma, searchResult])
            filteredBjImgUrl.push([
              notiConfig.BJIMG[BJID[i]],
              BJID[i],
              searchResult,
            ])
          }
        })
      })
    }

    if (filteredWord.length == 0 || filteredBjImgUrl.length == 0) {
      return { keyword, plusMinus, imgUrl, BJ }
    } else {
      filteredWord.sort(function (a, b) {
        if (a[2] > b[2]) return -1
        if (a[2] < b[2]) return 1
        return 0
      })
      filteredBjImgUrl.sort(function (a, b) {
        if (a[2] > b[2]) return -1
        if (a[2] < b[2]) return 1
        return 0
      })

      keyword = filteredWord[0][0]
      plusMinus = filteredWord[0][1]
      imgUrl = filteredBjImgUrl[0][0]
      BJ = filteredBjImgUrl[0][1]

      return { keyword, plusMinus, imgUrl, BJ }
    }
  }

  function doSomething(data) {
    console.log('do Something')
    console.log(data)
  }

  async function getSoundSrc(soundConfig, value, BJ) {
    value = Number(value)
    result = ''
    if (BJ == '') {
      return soundConfig.default
    } else {
      Object.keys(soundConfig[BJ]).forEach((조건번호) => {
        if (
          value >= Number(soundConfig[BJ][조건번호].UP) &&
          value <= Number(soundConfig[BJ][조건번호].DOWN)
        ) {
          result = `${BJ}/${soundConfig[BJ][조건번호].FILE}`
        }
      })
    }
    return result ? result : soundConfig.default
  }

  async function checkAfreeHpIdx(settings) {
    try {
      var response = await requestPromise(settings.afreehp.alertbox_url)
      if (response.statusCode == 200) {
        var matched_res = response.body.match(/idx:\s*"([a-zA-Z0-9_.~-]+)",/)
        if (matched_res !== null && matched_res.length > 1) {
          settings.afreehp.idx = matched_res[1]
          logger.info(`Get afreehp.idx succeed : ${settings.afreehp.idx}\n`)
        } else {
          logger.error('Get afreehp.idx parse failed.\n')
        }
      } else {
        logger.error('Get afreehp.idx failed.\n')
      }
    } catch (e) {
      logger.error('Error afreehp.idx parse: ' + e.toString())
    }

    if (settings.afreehp.idx === undefined) {
      logger.log('Can not find afreehp idx')
      return
    }

    return settings
  }

  async function inputListDonationData(notiData) {
    // 기존에 작성되어있는 Array 타입 JSON 파일
    let orderedList = JSON.parse(
      fs.readFileSync(
        path.join('list', `${getNewestList('_list.json')}`),
        'utf-8'
      )
    )
    notiData.number = orderedList.length + 1
    orderedList.push(notiData)

    fs.writeFileSync(
      path.join('list', `${getNewestList('_list.json')}`),
      JSON.stringify(orderedList)
    )
  }

  connect_afreehp()
}
