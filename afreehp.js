const util = require('util')

const io = require('socket.io-client')
const request = require('request')
const requestPromise = util.promisify(request)
const fs = require('fs')
var path = require('path')

module.exports = async (server) => {
  const SocketIO = require('socket.io')(server, { path: '/socket.io' })
  function doSomething(cont) {
    console.log(cont)
  }
  //////////////////////////////////////////////////////////////////
  /// settings, alertbox url
  //////////////////////////////////////////////////////////////////
  var settings = require('./config/settings.json')
  //////////////////////////////////////////////////////////////////
  /// afreehp
  //////////////////////////////////////////////////////////////////
  console.log('==============================================')
  console.log('Initialize afreehp')
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

  function connect_afreehp() {
    if (settings.afreehp.idx === undefined) {
      console.log('can not find afreehp idx')
      return
    }

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

    socketAfreehp.on('cmd', function (data) {
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
          var { keyword, plusMinus, imgUrl } = getImgUrlFromMsg(
            config,
            data.data
          )
          switch (data.data.broad) {
            case 'afreeca':
              if (type == 'star') {
                console.log(
                  `Afreehp - starballoon : ${val} from ${name}(${id})`
                )
              } else if (type == 'adballoon') {
                console.log(`Afreehp - adballoon : ${val} from ${name}(${id})`)
              }
            default:
              break
          }

          notiData = {
            type: type,
            id: id,
            name: name,
            value: val,
            msg: data.data.msg,
            keyword: keyword,
            plusMinus: plusMinus,
            imgUrl: imgUrl,
            config: config,
          }

          SocketIO.emit('news', notiData)
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

    SocketIO.on('connection', (socket) => {
      socket.on('stop', (msg) => {
        console.log(msg)
        SocketIO.emit('stop', 'stop button click')
      })

      socket.on('resume', (msg) => {
        console.log(msg)
        SocketIO.emit('resume', 'resume button click')
      })
    })

    setTimeout(function () {
      socketAfreehp.connect()
    }, 1000)
  }

  function getImgUrlFromMsg(notiConfig, data) {
    let BJID = Object.keys(notiConfig.BJID)
    let filteredWord = []
    let filteredBjImgUrl = []

    let keyword = ''
    let plusMinus = ''
    let imgUrl = notiConfig.BJIMG.default

    for (i in BJID) {
      // bJID[0] == 'ori'
      Object.keys(notiConfig.BJID[BJID[i]]).forEach((plma) => {
        notiConfig.BJID[BJID[i]][plma].forEach((keyword) => {
          var searchResult = String(data.msg).search(keyword)
          if (searchResult != -1) {
            filteredWord.push([keyword, plma, searchResult])
            filteredBjImgUrl.push([notiConfig.BJIMG[BJID[i]], searchResult])
          }
        })
      })
    }

    if (filteredWord.length == 0 || filteredBjImgUrl.length == 0) {
      return { keyword, plusMinus, imgUrl }
    } else {
      filteredWord.sort(function (a, b) {
        if (a[2] > b[2]) return -1
        if (a[2] < b[2]) return 1
        return 0
      })

      filteredBjImgUrl.sort(function (a, b) {
        if (a[1] > b[1]) return -1
        if (a[1] < b[1]) return 1
        return 0
      })

      keyword = filteredWord[0][0]
      plusMinus = filteredWord[0][1]
      imgUrl = filteredBjImgUrl[0][0]

      return { keyword, plusMinus, imgUrl }
    }
  }

  connect_afreehp()
}
