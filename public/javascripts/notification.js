'use strict'

let timerInterval = null
let ttsUrl = 'http://nstream.kr:1322/'
let list = new Array()
var notiPopUpInterval = null

socket.on('news', async function (data) {
  // await sweetAlert(data)
  list.push(data)
  console.log(list)
})

socket.on('connect', function (reason) {
  console.log('conn')
  notiPopUpInterval = setTimeout(tick, 1000)
})

async function tick() {
  console.log(list.length)
  if (list.length > 0) {
    const el = list.shift()
    var notiSound = new Audio()
    var ttsReady = false
    var soundReady = false
    setTimeout(tick, 1000)
  } else {
    notiPopUpInterval = setTimeout(tick, 1000)
  }
}

async function sweetAlert(data) {
  ttsUrl +=
    ttsUrl +
    tssDialogGen(data, data.config.script) +
    '/' +
    data.config.SPEAKING_RATE +
    '/' +
    data.config.SPEAKING_VOICE

  console.log(ttsUrl)
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
    timer: 10000,
    imageUrl: data.imgUrl,
    imageAlt: 'A image',
    showConfirmButton: false,
    backdrop: `rgba(0,0,0,0.0)`,
    didOpen: async () => {
      const content = Swal.getHtmlContainer()
      const $ = content.querySelector.bind(content)
      const stop = $('#stop')
      const resume = $('#resume')

      function toggleButtons() {
        stop.disabled = !Swal.isTimerRunning()
        resume.disabled = Swal.isTimerRunning()
      }

      stop.addEventListener('click', () => {
        Swal.stopTimer()
        toggleButtons()
      })

      resume.addEventListener('click', () => {
        Swal.resumeTimer()
        toggleButtons()
      })

      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('strong').textContent = (
          Swal.getTimerLeft() / 1000
        ).toFixed(0)
      }, 100)

      socket.on('stop', function (data) {
        console.log(data)
        // document.querySelector('#stop').click()
        Swal.stopTimer()
      })

      socket.on('resume', function (data) {
        console.log(data)
        // document.querySelector('#resume').click()
        Swal.resumeTimer()
      })

      /* notiSound.play()
      var setTimeoutID = setTimeout(() => {
        notiTextToSpeach.play()
        clearTimeout(setTimeoutID)
      }, 2000) */
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
  // reqUrl = reqUrl.replaceAll('[break]', '')
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
