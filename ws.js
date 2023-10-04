function ws(main, no) {
  var socket = null
  var broad = {}
  if (main === true) {
    socket = page.afreeca.socket
    broad = page.afreeca.broad
  } else if (page.afreeca.data.relay[no] !== undefined) {
    socket = page.afreeca.data.relay[no].socket
    broad = page.afreeca.data.relay[no].broad
  }

  if (socket !== null) {
    if (socket.readyState === 1) return
    else {
      socket.onclose = function () {}
      socket.onerror = function () {}
      socket.close()
    }
  }

  if (main === true) {
    socket = page.afreeca.socket = new WebSocket(
      'ws://' + broad.chat_ip + ':' + broad.chat_port + '/Websocket',
      'chat'
    )
  } else if (page.afreeca.data.relay[no] !== undefined) {
    socket = page.afreeca.data.relay[no].socket = new WebSocket(
      'ws://' + broad.chat_ip + ':' + broad.chat_port + '/Websocket',
      'chat'
    )
  }

  socket.binaryType = 'arraybuffer'
  socket._main = main
  socket._no = no
  socket._broad = broad

  if (main === true) {
    connect.afreeca.reconnect(true)
  }

  socket.onopen = function (e) {
    //player.afreecatv.broad.FTK = loginInfo.bjtoken;
    //TODO 채팅입력시 token 으로 접속 필요 //TODO USERLEVEL.GUEST 말고는 안됨
    var chatToken = ''
    // if(pageInfo.widget !== undefined && pageInfo.widget === "inputchat" && page.afreeca.data.chat !== "") {
    // chatToken = page.afreeca.data.chat;
    // }
    // else if(pageInfo.id === "campaign" && pageInfo.sub === "bnr" && loginInfo.afreeca.bnrtoken !== "") {
    // //매니저도우미로 로그인 후 메시지 전송
    // chatToken = loginInfo.afreeca.bnrtoken;
    // }
    if (
      pageInfo.id === 'chat' &&
      pageInfo.widget !== undefined &&
      pageInfo.widget === 'inputchat' &&
      page.afreeca.data.chat !== ''
    ) {
      chatToken = page.afreeca.data.chat
    } else if (
      pageInfo.id === 'campaign' &&
      pageInfo.sub === 'bnr' &&
      page.afreeca.data.chat !== ''
    ) {
      chatToken = page.afreeca.data.chat
    }

    socket.send(afreeca.login(chatToken, '', afreeca.USERLEVEL.BJ))
  }

  socket.onmessage = function (e) {
    var t = null
    e.data instanceof ArrayBuffer
      ? ((t = e.data), afreeca.parseMessage(t, socket))
      : (t = afreeca.readBuffer(e.data, socket))
  }

  if (main === true) {
    socket.onclose = function (e) {
      connect.afreeca.reconnect(true)
    }
    socket.onerror = function (e) {
      connect.afreeca.reconnect(true)
    }
  }
}
