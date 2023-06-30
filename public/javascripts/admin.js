document.addEventListener('DOMContentLoaded', async function () {
  renderNowKeyWord()
})
socket.on('afreecaHpUrl', async (msg) => {
  document.querySelector('#afreecaHpUrl').innerText = msg
})

document.querySelector('#urlSettingBtn').addEventListener('click', (e) => {
  e.preventDefault()
  console.log('restart button clicked')
  socket.emit('restart', document.querySelector('#urlSettingInput').value)
})

document
  .querySelector('#keyWordSaveBtn')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    var bj = $('input:radio[name=selBJ]:checked').val()
    var plusMinus = $('input:radio[name=plusMinus]:checked').val()
    var keyWord = $('#keyWordInput').val()

    fetch('notification/setting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bj: bj,
        plusMinus: plusMinus,
        keyWord: keyWord,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.ok) {
          alert('성공적으로 저장되었습니다')
          renderNowKeyWord()
        } else {
          alert('저장에 실패했습니다')
        }
      })

    $('input:radio[name=selBJ]').prop('checked', false)
    $('input:radio[name=plusMinus]').prop('checked', false)
    $('#keyWordInput').val('')
  })

function deleteBtnClick(event) {
  event.preventDefault()
  var data = {
    keyWord: event.target.getAttribute('data-word'),
    bj: event.target.getAttribute('data-bj'),
    plusMinus: event.target.getAttribute('data-plusMinus'),
  }
  if (confirm('삭제하시겠습니까?')) {
    fetch('notification/setting', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.ok) {
          alert('성공적으로 저장되었습니다')
          renderNowKeyWord()
        } else {
          alert('저장에 실패했습니다')
        }
      })
  } else {
  }
  console.log(data)
}

/* document.querySelector('#stopBtn').addEventListener('click', (e) => {
      e.preventDefault()
      console.log('stop button clicked')
      socket.emit('stop', 'stop')
    })
    document.querySelector('#resumeBtn').addEventListener('click', (e) => {
      e.preventDefault()
      console.log('resume button clicked')
      socket.emit('resume', 'resume')
    }) */

async function renderNowKeyWord() {
  await fetch('/notification/setting')
    .then((response) => response.json())
    .then(async (data) => {
      var BJs = Object.keys(data.BJID)
      for (i in BJs) {
        renderKeyWord('plus', data.BJID[BJs[i]].plus, BJs[i])
        renderKeyWord('minus', data.BJID[BJs[i]].minus, BJs[i])
      }
      document.querySelector('#keywordNow')
    })
}

function renderKeyWord(mode, arr, BJ) {
  var querySel = `#keywordNow .${BJ} .${mode}`
  document.querySelector(querySel).innerHTML =
    mode == 'plus' ? '플러스' : '마이너스'
  arr.forEach((element) => {
    var newBtn = document.createElement('Button')
    newBtn.innerText = element
    newBtn.classList.add('btn', 'btn-primary', 'delete', 'rounded')
    newBtn.setAttribute('data-word', element)
    newBtn.setAttribute('data-bj', BJ)
    newBtn.setAttribute('data-plusMinus', mode)
    newBtn.addEventListener('click', deleteBtnClick)

    document.querySelector(querySel).appendChild(newBtn)
  })
}
