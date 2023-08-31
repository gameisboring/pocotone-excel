document.addEventListener('DOMContentLoaded', async function () {
  renderListVar()
  setOpacity()
})

var fetchInterval = null

var body = document.querySelector('#main .body')

fetchInterval = setInterval(renderListVar, 5000)

socket.on('scoreboard', (msg) => {
  var html = ''
  for (var i in msg.result) {
    if (msg.result[i].name != '') {
      html += addListBar(msg.result[i], Number(i) + 1)
    }
  }
  body.innerHTML = html
  document.querySelector('#totalCount').innerText = total
})

socket.on('disconnect', (reason) => {})

socket.on('connection', (reason) => {})

function addListBar(data) {
  var rank = data.rank
  var barImageFileName = 'normal'
  /* if (rank == 1) {
    barImageFileName = 1
  } else if (rank == 2) {
    barImageFileName = 2
  } else if (rank == 3) {
    barImageFileName = 3
  } else if (rank == 4) {
    barImageFileName = 'low'
  } else {
    barImageFileName = 'normal'
  } */

  const bar = document.createElement('div')

  const barTextMenu = document.createElement('div')

  var el = `<div class="bar">
  <img src="../images/board/listbar_${barImageFileName}.png" alt="" />
  <div class="barText menu">
    <span class="rank">${data.rank}</span>
    <span class="bj">${data.BJ}</span>
    <span class="score">${data.score}</span>
    <span class="contribute">${data.contribute}</span>
  </div>
</div>`

  return el
}

function renderListVar() {
  fetch('/board/data', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      body.innerHTML = ''
      for (var i in response) {
        body.innerHTML += addListBar(response[i])
      }
    })
}

function setOpacity() {
  fetch('../admin/notification/setting', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      document.getElementById('main').style.opacity = response.BOARD_OP / 100
    })
}
