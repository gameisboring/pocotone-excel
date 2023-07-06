var fetchInterval = null

var body = document.querySelector('#main .body')

renderListVar()

fetchInterval = setInterval(renderListVar, 5000)

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
    <span class="donator">${data.donator}</span>
    <span class="score">${data.quantity}</span>
  </div>
</div>`

  return el
}

function renderListVar() {
  fetch('rank/data', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      body.innerHTML = ''
      console.log(response)
      for (var i = 0; i < response.limit; i++) {
        console.log()
        body.innerHTML += addListBar(response.result[i])
      }
    })
}

// document.querySelector('#main').style.opacity = 1
