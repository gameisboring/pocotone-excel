var fetchInterval = null

var body = document.querySelector('#main .body')

renderListVar()

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
  var barImageFileName
  var rank = data.rank
  if (rank == 1) {
    barImageFileName = 1
  } else if (rank == 2) {
    barImageFileName = 2
  } else if (rank == 3) {
    barImageFileName = 3
  } else if (rank == 4) {
    barImageFileName = 'low'
  } else {
    barImageFileName = 'normal'
  }

  var el = `<div class="bar">
  <img src="images/bj/listbar_${barImageFileName}.png" alt="" />
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
  fetch('board/data', {
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
