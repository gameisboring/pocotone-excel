const util = require('util')

const io = require('socket.io-client')
const request = require('request')
const requestPromise = util.promisify(request)
const fs = require('fs')
var path = require('path')
const { dateFormat } = require('./time')
const { getNewestList } = require('./fileControl')

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
  console.log('==============================================')
  console.log('Initialize afreehp')

  async function connect_afreehp() {
    require('./fileControl').makeListFile()

    settings = await checkAfreeHpIdx(
      JSON.parse(fs.readFileSync(path.join('config', 'settings.json')))
    )

    const url_ws_afreehp = 'http://afreehp.kr:13536'
    const socketAfreehp = io(url_ws_afreehp, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 10000,
      autoConnect: false,
    })

    var page = {
      idx: settings.afreehp.idx,
      // pagelist: [{pageid: "alert", subpage: "0"}],
      // platform: {twitch: "twitch_channel_id", youtube: "youtube_channel_unique_code"}
    }

    socketAfreehp.on('connect', function () {
      socketAfreehp.emit('page', page)
      // socket.send("pagecmd", pagecmd);
    })

    socketAfreehp.on('cmd', async function (data) {
      var config = ''

      if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
        console.log(`please write file "APIconfig.json"`)
      } else {
        config = JSON.parse(
          fs.readFileSync(path.join('config', 'notiConfig.json'))
        )
      }

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
            console.log(
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
        console.error('Afreehp message parse error: ', e.toString())
      }
    })

    socketAfreehp.on('error', function () {
      console.error('Afreehp error')
    })

    socketAfreehp.on('close', function () {
      console.log('Afreehp close')
    })
    socketAfreehp.on('connect_error', function (err) {
      console.error('Afreehp connect_error')
      console.error(err)
    })

    setTimeout(function () {
      socketAfreehp.connect()
    }, 1000)
  }

  SocketIO.on('connection', (socket) => {
    socket.emit('afreecaHpUrl', settings.afreehp.alertbox_url)

    socket.on('stop', (msg) => {
      console.log(msg)
      SocketIO.emit('stop', 'stop button click')
    })

    socket.on('resume', (msg) => {
      console.log(msg)
      SocketIO.emit('resume', 'resume button click')
    })

    socket.on('restart', (msg) => {
      console.log('restart server : afreeca helper url : ', msg)
      settings.afreehp.alertbox_url = msg
      delete settings.afreehp.idx
      fs.writeFileSync(
        path.join('config', 'settings.json'),
        JSON.stringify(settings)
      )

      socket.emit('afreecaHpUrl', settings.afreehp.alertbox_url)

      connect_afreehp()
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
        var matched_res = response.body.match(/idx:\s*"([a-zA-Z0-9]+)",/)
        if (matched_res !== null && matched_res.length > 1) {
          settings.afreehp.idx = matched_res[1]
          console.log(`Get afreehp.idx succeed : ${settings.afreehp.idx}\n`)
        } else {
          console.error('Get afreehp.idx parse failed.\n')
        }
      } else {
        console.error('Get afreehp.idx failed.\n')
      }
    } catch (e) {
      console.error('Error afreehp.idx parse: ' + e.toString())
    }

    if (settings.afreehp.idx === undefined) {
      console.log('Can not find afreehp idx')
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
