var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
)
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

document.addEventListener('DOMContentLoaded', async function () {
  renderNowKeyWord()
  renderConditions()
  renderBoardSetting()
  renderRankSetting()

  await fetch('/notiConfig.json')
    .then((response) => response.json())
    .then(async (data) => {
      document.getElementById('boardOpacity').value = data.BOARD_OP
      document.getElementById('boardOpacitySpan').innerText =
        data.BOARD_OP + '%'

      document.getElementById('rankOpacity').value = data.RANK_OP
      document.getElementById('rankOpacitySpan').innerText = data.RANK_OP + '%'
    })
})
socket.on('afreecaHpUrl', async (msg) => {
  document.querySelector('#afreecaHpUrl').innerText = msg
})

document.querySelector('#urlSettingForm').addEventListener('submit', (e) => {
  e.preventDefault()
  console.log('restart button clicked')
  socket.emit('urlSetting', document.querySelector('#urlSettingInput').value)
})

document.querySelector('#scriptSaveForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const script = e.target.querySelector('input').value
  fetch('admin/script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ script: script }),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      e.target.querySelector('input').value = ''
    })
})

document.querySelector('#serverResetBtn').addEventListener('click', (e) => {
  e.preventDefault()
  var result = confirm(
    '서버가 재시작 됩니다. 설정은 그대로 유지되며, 후원기록은 초기화 됩니다.'
  )
  if (result) {
    socket.emit('restart', 'restart!')
  }
})

document.querySelector('#donaLogSaveForm').addEventListener('submit', (e) => {
  e.preventDefault()
  var bj = $('input:radio[name=newLogSelBJ]:checked').val()
  var plusMinus = $('input:radio[name=newLogPlusMinus]:checked').val()
  var value = $('#newLogValue').val()
  var name = $('#newLogName').val()
  var msg = $('#newLogMsg').val()
  console.log(
    JSON.stringify({
      bj: bj,
      plusMinus: plusMinus,
      value: value,
      name: name,
      msg: msg,
    })
  )

  fetch('admin/newlog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bj: bj,
      plusMinus: plusMinus,
      value: value,
      name: name,
      msg: msg,
    }),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
    })

  $('input:radio[name=newLogSelBJ]').prop('checked', false)
  $('input:radio[name=newLogPlusMinus]').prop('checked', false)
  $('#newLogValue').val('')
  $('#newLogMsg').val('')
  $('#newLogName').val('')
})

document
  .querySelector('#conditionConfigSaveBtn')
  .addEventListener('click', (e) => {
    e.preventDefault()
    var sendObj = { ori: {}, yam: {}, hiyoko: {}, dal: {} }
    const conditionBars = document.querySelectorAll('#condition .conditionBar')

    conditionBars.forEach((conditionBar) => {
      const bj = conditionBar.getAttribute('data-bj')
      if (bj == 'default') {
        sendObj[bj] = conditionBar.querySelector(
          `#${bj}-sound-filename`
        ).innerText
      } else {
        const number = conditionBar.getAttribute('data-number')
          ? conditionBar.getAttribute('data-number')
          : ''
        var conditionObj = { UP: '', DOWN: '', FILE: '' }
        conditionBar.querySelectorAll('input').forEach((input) => {
          if (input.type == 'number') {
            console.log(
              input.getAttribute('data-bj'),
              input.getAttribute('data-updown')
            )
            if (input.getAttribute('data-updown') == 'up') {
              conditionObj.UP = input.value
            } else if (input.getAttribute('data-updown') == 'down') {
              conditionObj.DOWN = input.value
            }
          }
        })
        conditionObj.FILE = conditionBar.querySelector(
          `#${bj}-${number}-sound-filename`
        ).innerText

        sendObj[bj][number] = conditionObj
      }
    })

    fetch('admin/setting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendObj),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response)
      })

    console.log(sendObj)
  })

document
  .querySelector('#keyWordSaveForm')
  .addEventListener('submit', async (e) => {
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

document.getElementById('boardOpacity').addEventListener('input', (e) => {
  ShowSliderValue(e.target.value, 'boardOpacitySpan')
  document.getElementById('BoardMain').style.opacity = e.target.value + '%'
})
document.getElementById('rankOpacity').addEventListener('input', (e) => {
  ShowSliderValue(e.target.value, 'rankOpacitySpan')
  document.getElementById('RankMain').style.opacity = e.target.value + '%'
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

document.querySelector('#stopBtn').addEventListener('click', (e) => {
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
})

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
        // img change button element
        const buttonEl = document.createElement('button')
        buttonEl.classList.add(
          'bg-transparent',
          'border-0',
          'mx-auto',
          'imageBtn',
          'position-relative'
        )

        // file input element
        const fileInput = document.createElement('input')
        fileInput.setAttribute('type', 'file')
        fileInput.setAttribute('id', `${bj}-image-file`)
        fileInput.classList.add('d-none')
        fileInput.addEventListener('change', (e) => {
          e.preventDefault()
          imageFileUpload(e.target, bj)
        })

        // img element
        const imgEl = document.createElement('img')
        imgEl.src = data.BJIMG[bj]
        imgEl.classList.add('img-thumbnail', 'rounded', 'd-block', 'w-100')
        imgEl.setAttribute('id', `${bj}-image`)

        // img change Text div
        const changeText = document.createElement('div')
        changeText.innerText = '이미지 교체'
        changeText.classList.add('centerd')
        buttonEl.appendChild(changeText)
        buttonEl.appendChild(imgEl)

        // button add event
        buttonEl.addEventListener('click', (e) => {
          e.preventDefault()
          fileInput.click()
        })
        buttonEl.addEventListener('mouseenter', (e) => {
          e.preventDefault()
          e.target.querySelector('.centerd').style.display = 'block'
        })
        buttonEl.addEventListener('mouseleave', (e) => {
          e.preventDefault()
          e.target.querySelector('.centerd').style.display = 'none'
        })

        // img change button append
        document.querySelector(`#${bj}-conditions`).prepend(buttonEl)
        document.querySelector(`#${bj}-conditions`).append(fileInput)

        if (typeof data.BJSOUND[bj] == 'object') {
          // if condition is for BJ

          Object.keys(data.BJSOUND[bj]).forEach((num) => {
            renderConditionBar(bj, num, data.BJSOUND[bj][num])
          })
          addAddBtn(bj)
        } else if (typeof data.BJSOUND[bj] == 'string') {
          // if condition is for Default
          const fileInput = document.createElement('input')
          fileInput.setAttribute('type', 'file')
          fileInput.setAttribute('id', `${bj}-sound`)
          fileInput.classList.add('d-none')
          fileInput.addEventListener('change', (e) => {
            e.preventDefault()
            soundFileUpload(e.target, bj)
          })
          document.querySelector(`#${bj}-sound-filename`).innerText =
            data.BJSOUND[bj]
          document.querySelector(`#${bj}-conditions`).appendChild(fileInput)
        }
      })
    })
}

function renderConditionBar(bj, num, data) {
  let bjDiv = document.getElementById(bj + '-conditions')

  const conditionBar = document.createElement('div')

  conditionBar.classList.add(
    'd-flex',
    'justify-content-between',
    'conditionBar'
  )

  conditionBar.setAttribute('data-number', num)
  conditionBar.setAttribute('data-bj', bj)

  var html = `<div>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="up"
                  data-number="${num}"
                  value="${data ? data.UP : ''}"
                /><span>이상</span>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="down"
                  data-number="${num}"
                  value="${data ? data.DOWN : ''}"
                /><span>이하</span>
              </div>
              <div>
                <span>알림음 : </span>
                <span id="${bj}-${num}-sound-filename">${
    data ? data.FILE : ''
  }</span>
                <label class="btn btn-light rounded" for="${bj}-${num}-sound">
                  파일 변경
                </label>
              </div>`

  const fileInput = document.createElement('input')
  fileInput.setAttribute('type', 'file')
  fileInput.setAttribute('id', `${bj}-${num}-sound`)
  fileInput.classList.add('d-none')
  fileInput.addEventListener('change', (e) => {
    e.preventDefault()
    soundFileUpload(e.target, bj, num)
  })

  conditionBar.innerHTML = html
  conditionBar.appendChild(fileInput)

  bjDiv.appendChild(conditionBar)
}

function renderKeyWord(mode, arr, BJ) {
  var querySel = `#keywordPresent2 tbody`
  arr.forEach((element) => {
    const newTr = document.createElement('tr')
    const bjTd = document.createElement('th')
    const plusMinusTd = document.createElement('td')
    const keyWordTd = document.createElement('td')

    bjTd.scope = 'row'
    bjTd.innerText = bjName(BJ)
    plusMinusTd.innerText = mode == 'plus' ? '플러스' : '마이너스'
    keyWordTd.innerText = element

    newTr.append(bjTd)
    newTr.append(plusMinusTd)
    newTr.append(keyWordTd)
    newTr.classList.add(
      mode == 'plus' ? 'table-primary' : 'table-danger',
      'pointer'
    )

    newTr.setAttribute('data-word', element)
    newTr.setAttribute('data-bj', BJ)
    newTr.setAttribute('data-plusMinus', mode)
    newTr.addEventListener('click', deleteBtnClick)

    document.querySelector(querySel).appendChild(newTr)
  })
}

/* function renderKeyWord(mode, arr, BJ) {
  var querySel = `#keywordPresent .${BJ}  .${mode}`
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
} */

async function soundFileUpload(target, bj, num) {
  console.log(target.files[0])
  let formData = new FormData()
  formData.append('bj', bj)
  if (num) {
    formData.append('num', num)
  }
  formData.append('file', target.files[0])

  // 파일 음악파일 만 필터링
  // 기존 파일 삭제 여부
  await fetch('admin/setting/sound', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      let fileNameSpan
      if (num) {
        fileNameSpan = `#${bj}-${num}-sound-filename`
      } else {
        fileNameSpan = `#${bj}-sound-filename`
      }
      alert('성공적으로 저장되었습니다')
      document.querySelector(fileNameSpan).innerText = response.originalname
    })
}

async function imageFileUpload(target, bj) {
  console.log(target.files[0])
  let formData = new FormData()
  formData.append('bj', bj)
  formData.append('file', target.files[0])

  // 파일 음악파일 만 필터링
  // 기존 파일 삭제 여부
  await fetch('admin/setting/image', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      let fileNameSpan
      fileNameSpan = `#${bj}-image`
      alert('성공적으로 저장되었습니다')
      document.querySelector(
        fileNameSpan
      ).src = `images/${response.originalname}`
    })
}

function addAddBtn(bj) {
  const addCondition = document.createElement('button')
  addCondition.innerText = '조건 추가'
  addCondition.setAttribute('data-bj', bj)
  addCondition.classList.add('w-50', 'mx-auto', 'btn', 'btn-light', 'rounded')
  addCondition.addEventListener('click', (e) => {
    e.preventDefault()
    const bj = e.target.getAttribute('data-bj')
    const num =
      document.querySelectorAll(`#${bj}-conditions .conditionBar`).length + 1
    renderConditionBar(bj, num)
  })
  document.querySelector(`#${bj}-conditions`).appendChild(addCondition)
}

function renderBoardSetting() {
  fetch('board/img', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      response.forEach((image) => {
        var div = document.createElement('div')
        div.classList.add('d-flex', 'flex-column')
        div.setAttribute('id', `board-${image}`)
        div.setAttribute('data-cat', `board`)
        div.setAttribute('data-filename', image)

        /* var span = document.createElement('div')
        span.innerText = image */

        var img = document.createElement('img')
        img.src = `images/board/${image}`
        img.id = `board-img-${image}`

        var file = document.createElement('input')
        file.type = 'file'
        file.setAttribute('id', `board-file-${image}`)
        file.setAttribute('data-cat', `board`)
        file.setAttribute('data-filename', image)
        file.classList.add('d-none')
        file.addEventListener('change', (e) => {
          e.preventDefault()
          var data = {
            fileName: e.target.getAttribute('data-filename'),
            category: e.target.getAttribute('data-cat'),
            file: e.target.files[0],
          }
          boardImgFileUpload(data)
        })

        var label = document.createElement('label')
        label.setAttribute('for', `board-file-${image}`)
        label.classList.add(
          'btn',
          'btn-primary',
          'd-flex',
          'p-0',
          'w-50',
          'justify-content-center',
          'align-items-center',
          'fs-5',
          'rounded'
        )
        label.innerText = '변경'

        var innerDiv = document.createElement('div')
        innerDiv.classList.add('d-flex', 'justify-content-between', 'gap-4')

        // div.appendChild(span)
        innerDiv.appendChild(img)
        innerDiv.appendChild(label)
        div.appendChild(innerDiv)
        div.appendChild(file)
        document.querySelector('#boardSettingImages').append(div)
      })
    })
}

function renderRankSetting() {
  fetch('rank/img', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      response.forEach((image) => {
        var div = document.createElement('div')
        div.classList.add('d-flex', 'flex-column')
        div.setAttribute('id', `rank-${image}`)
        div.setAttribute('data-cat', `rank`)
        div.setAttribute('data-filename', image)

        /* var span = document.createElement('div')
        span.innerText = image */

        var img = document.createElement('img')
        img.src = `images/rank/${image}`
        img.id = `rank-img-${image}`

        var file = document.createElement('input')
        file.type = 'file'
        file.setAttribute('id', `rank-file-${image}`)
        file.setAttribute('data-cat', `rank`)
        file.setAttribute('data-filename', image)
        file.classList.add('d-none')
        file.addEventListener('change', (e) => {
          e.preventDefault()
          var data = {
            fileName: e.target.getAttribute('data-filename'),
            category: e.target.getAttribute('data-cat'),
            file: e.target.files[0],
          }
          boardImgFileUpload(data)
        })

        var label = document.createElement('label')
        label.setAttribute('for', `rank-file-${image}`)
        label.classList.add(
          'btn',
          'btn-primary',
          'd-flex',
          'p-0',
          'w-50',
          'justify-content-center',
          'align-items-center',
          'fs-5',
          'rounded'
        )
        label.innerText = '변  경'

        var innerDiv = document.createElement('div')
        innerDiv.classList.add('d-flex', 'justify-content-start', 'gap-4')

        // div.appendChild(span)
        innerDiv.appendChild(img)
        innerDiv.appendChild(label)
        div.appendChild(innerDiv)
        div.appendChild(file)
        document.querySelector('#rankingSettingImages').append(div)
      })
    })
}

function boardImgFileUpload(data) {
  console.log(data)

  let formData = new FormData()
  formData.append('category', data.category)
  formData.append('fileName', data.fileName)
  formData.append('file', data.file)

  fetch(`admin/${data.category}/image`, {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      alert('성공적으로 저장되었습니다')
      console.log(response)
      var img = document.getElementById(`board-img-${data.fileName}`)
      img.src = `images/${data.category}/${data.fileName}`
    })
}

document.querySelector('#boardSettingForm').addEventListener('submit', (e) => {
  e.preventDefault()
  var opacity = e.target.querySelector('input').value
  if (opacity > 100 && opacity < 0) {
    alert('1부터 100까지의 숫자를 입력해주세요')
  } else {
    fetch(`admin/board/opacity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opacity: opacity }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response)
        alert('성공적으로 저장되었습니다')
      })
  }
})

document
  .querySelector('#rankingSettingForm')
  .addEventListener('submit', (e) => {
    e.preventDefault()
    var opacity = e.target.querySelector('input').value
    if (opacity > 100 && opacity < 0) {
      alert('1부터 100까지의 숫자를 입력해주세요')
    } else {
      fetch(`admin/rank/opacity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opacity: opacity }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response)
          alert('성공적으로 저장되었습니다')
        })
    }
  })

document
  .querySelector('#rankingLimitSettingForm')
  .addEventListener('submit', (e) => {
    e.preventDefault()
    var limit = e.target.querySelector('input').value
    if (limit < 0) {
      alert('1이상의 숫자를 입력해주세요')
    } else {
      fetch(`admin/rank/limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: limit }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response)
          alert('성공적으로 저장되었습니다')
        })
    }
  })

document.getElementById('navBoardBtn').addEventListener('click', navBtnClickFn)
document.getElementById('navNotiBtn').addEventListener('click', navBtnClickFn)
document.getElementById('navDataBtn').addEventListener('click', navBtnClickFn)

function navBtnClickFn(e) {
  e.preventDefault()
  const targetId = e.target.getAttribute('data-field')
  document.querySelectorAll('#main > div').forEach((col) => {
    if (col.id == targetId) {
      document.getElementById(col.id).classList.remove('d-none')
    } else {
      document.getElementById(col.id).classList.add('d-none')
    }
  })
}

function ShowSliderValue(val, id) {
  var opValueView = document.getElementById(id)
  opValueView.innerHTML = val + '%'
}

function bjName(bjid) {
  if (bjid == 'ori') {
    return '오리꿍'
  } else if (bjid == 'dal') {
    return '달체솜'
  } else if (bjid == 'hiyoko') {
    return '히요코'
  } else if (bjid == 'yam') {
    return '얌'
  }
}
