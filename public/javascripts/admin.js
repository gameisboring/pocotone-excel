document.addEventListener('DOMContentLoaded', async function () {
  renderNowKeyWord()
  renderConditions()
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
  .querySelector('#conditionConfigSaveBtn')
  .addEventListener('click', (e) => {
    e.preventDefault()
    var sendObj = {}
    const inputs = document.querySelectorAll('#condition input')
    inputs.forEach((input) => {
      if (input.getAttribute('type') == 'number') {
        console.log('this is number', input.value)
      } else if (input.getAttribute('type') == 'file') {
        console.log('this is file', input.value)
      }
    })
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
  e.target.classList.add('d-none')
  document.querySelector('#resumeBtn').classList.remove('d-none')
  socket.emit('stop', 'stop')
})
document.querySelector('#resumeBtn').addEventListener('click', (e) => {
  e.preventDefault()
  e.target.classList.add('d-none')
  document.querySelector('#stopBtn').classList.remove('d-none')
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
      document.querySelector('#keywordPresent')
    })
}

async function renderConditions() {
  await fetch('/notification/setting')
    .then((response) => response.json())
    .then(async (data) => {
      Object.keys(data.BJSOUND).forEach((bj) => {
        if (typeof data.BJSOUND[bj] == 'object') {
          console.log(bj)
          Object.keys(data.BJSOUND[bj]).forEach((num) => {
            renderConditionBar(data.BJSOUND[bj][num], bj, num)
          })
          const addCondition = document.createElement('button')
          addCondition.innerText = '조건 추가'
          addCondition.setAttribute('data-bj', bj)
          addCondition.addEventListener('click', (e) => {
            e.preventDefault()
            const bj = e.target.getAttribute('data-bj')
            console.log(bj)
          })
          document.querySelector(`#${bj}-conditions`).appendChild(addCondition)
        }
      })
    })
}

function renderConditionBar(data, bj, num) {
  let bjDiv = document.getElementById(bj + '-conditions')

  const conditionBar = document.createElement('div')

  conditionBar.classList.add('d-flex', 'justify-content-between')

  var html = `<div>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="up"
                  data-number="${num}"
                  value="${data.UP}"
                /><span>이상</span>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="down"
                  data-number="${num}"
                  value="${data.DOWN}"
                /><span>이하</span>
              </div>
              <div>
                <span>알림음 : </span>
                <span id="${bj}-${num}-sound-filename">${data.FILE}</span>
                <label class="btn btn-primary rounded" for="${bj}-${num}-sound">
                  파일 변경
                </label>
              </div>`

  const fileInput = document.createElement('input')
  fileInput.setAttribute('type', 'file')
  fileInput.setAttribute('id', `${bj}-${num}-sound`)
  fileInput.classList.add('d-none')
  fileInput.addEventListener('change', (e) => {
    e.preventDefault()
    const fileNameSpan = `#${e.target.id}-filename`
    const files = e.target.value.split('\\')
    document.querySelector(fileNameSpan).innerText = files[files.length - 1]
  })

  conditionBar.innerHTML = html
  conditionBar.appendChild(fileInput)

  bjDiv.appendChild(conditionBar)
}

function renderKeyWord(mode, arr, BJ) {
  var querySel = `#keywordPresent .${BJ} .${mode}`
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
