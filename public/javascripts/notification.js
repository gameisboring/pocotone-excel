'use strict'

let timerInterval = null
let list = new Array()
var notiPopUpInterval = null
var notiTerm = 2000
var timer = 0
var leftTimer = 0
socket.on('news', async function (data) {
  // await sweetAlert(data)
  list.push(data)
})

/* socket.on('stop', function (data) {
  leftTimer = Swal.getTimerLeft()
  clearTimeout(notiPopUpInterval)
  Swal.stopTimer()
})

socket.on('resume', function (data) {
  notiPopUpInterval = setTimeout(tick, leftTimer)
  Swal.resumeTimer()
}) */
notiPopUpInterval = setTimeout(tick, 1000)
socket.on('connect', function (reason) {})

async function tick() {
  var ttsReady = false
  var soundReady = false
  let ttsUrl = 'http://nstream.kr:1322/'

  if (list.length > 0) {
    console.log(`현재 남은 알림 수 : ${list.length} 개`)
    const el = list.shift()

    if (el.bj == 'ori') {
      el.bj = '오리꿍'
    } else if (el.bj == 'yam') {
      el.bj = '얌'
    } else if (el.bj == 'dal') {
      el.bj = '달체솜'
    } else if (el.bj == 'hiyoko') {
      el.bj = '히요코'
    }

    ttsUrl +=
      tssDialogGen(el, el.config.script) +
      '/' +
      el.config.SPEAKING_RATE +
      '/' +
      el.config.SPEAKING_VOICE

    let notiTextToSpeach
    let notiSound

    try {
      notiTextToSpeach = new Audio(ttsUrl)
    } catch (error) {
      console.log('notiTextToSpeach', error)
    }

    try {
      notiSound = new Audio('sounds/' + el.soundUrl)
    } catch (error) {
      console.log('notiSound', error)
    }

    notiSound.load()
    notiTextToSpeach.load()

    notiSound.onloadedmetadata = function () {
      soundReady = true
      checkBothAudiosReady()
    }
    notiTextToSpeach.onloadedmetadata = function () {
      ttsReady = true
      checkBothAudiosReady()
    }

    function checkBothAudiosReady() {
      if (soundReady && ttsReady) {
        console.log(
          `both audios are Ready / Sound Dur: ${notiSound.duration} / TTS Dur: ${notiTextToSpeach.duration} / Noti Term :${notiTerm} `
        )

        timer =
          Math.floor(notiSound.duration * 1000) +
          Math.floor(notiTextToSpeach.duration * 1000) +
          notiTerm
        notiPopUpInterval = setTimeout(tick, timer)

        sweetAlert(el, notiSound, notiTextToSpeach, timer)
      }
    }
  } else {
    console.log(`남아 있는 알림 없음`)
    notiPopUpInterval = setTimeout(tick, 1000)
  }
}

async function sweetAlert(data, notiSound, notiTextToSpeach, timer) {
  Swal.fire({
    title: alertTextGen(data, data.config.script),
    html:
      '<strong></strong> <br/><br/>' +
      '<button id="stop" class="btn btn-danger">' +
      'STOP' +
      '</button><br/><br/>' +
      '<button id="resume" class="btn btn-success" disabled>' +
      'RESUME' +
      '</button><br/>',
    timer: timer,
    imageUrl: data.imgUrl,
    imageAlt: 'A image',
    showConfirmButton: false,
    backdrop: `rgba(0,0,0,0.0)`,
    didOpen: async () => {
      const content = Swal.getHtmlContainer()
      const $ = content.querySelector.bind(content)

      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('strong').textContent = (
          Swal.getTimerLeft() / 1000
        ).toFixed(0)
      }, 100)

      notiSound.play()
      var setTimeoutID = setTimeout(() => {
        notiTextToSpeach.play()
        clearTimeout(setTimeoutID)
      }, Math.floor(notiSound.duration * 1000))
    },
    willClose: () => {
      clearInterval(timerInterval)
    },
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
    }
  })
}

function tssDialogGen(data, script) {
  var reqUrl = String(script)
  Object.keys(data).forEach(function (key) {
    reqUrl = reqUrl.replace('[' + key + ']', data[key])
  })
  reqUrl = reqUrl.replaceAll('[break]', '')
  return encodeURIComponent(reqUrl)
}

function alertTextGen(data, script) {
  var text = script.replace(/\./g, ' ')
  Object.keys(data).forEach(function (key) {
    text = text.replace(
      '[' + key + ']',
      `<span class="${key}">${data[key]}</span>`
    )
  })
  text = text.replaceAll('[break]', `<br>`)
  return text
}
