document.addEventListener("DOMContentLoaded", async function () {
  renderNowKeyWord();
  renderConditions();
});
socket.on("afreecaHpUrl", async (msg) => {
  document.querySelector("#afreecaHpUrl").innerText = msg;
});

document.querySelector("#urlSettingBtn").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("restart button clicked");
  socket.emit("restart", document.querySelector("#urlSettingInput").value);
});

document.querySelector("#scriptSaveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const script = e.target.querySelector("input").value;
  fetch("admin/script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ script: script }),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      e.target.querySelector("input").value = "";
    });
});

document.querySelector("#donaLogSaveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  var bj = $("input:radio[name=newLogSelBJ]:checked").val();
  var plusMinus = $("input:radio[name=newLogPlusMinus]:checked").val();
  var value = $("#newLogValue").val();
  var name = $("#newLogName").val();
  var msg = $("#newLogMsg").val();
  console.log(
    JSON.stringify({
      bj: bj,
      plusMinus: plusMinus,
      value: value,
      name: name,
      msg: msg,
    })
  );

  fetch("admin/newlog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
      console.log(response);
    });

  $("input:radio[name=newLogSelBJ]").prop("checked", false);
  $("input:radio[name=newLogPlusMinus]").prop("checked", false);
  $("#newLogValue").val("");
  $("#newLogMsg").val("");
  $("#newLogName").val("");
});

document
  .querySelector("#conditionConfigSaveBtn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    var sendObj = { ori: {}, yam: {}, hiyoko: {}, dal: {} };
    const conditionBars = document.querySelectorAll("#condition .conditionBar");

    conditionBars.forEach((conditionBar) => {
      const bj = conditionBar.getAttribute("data-bj");
      if (bj == "default") {
        sendObj[bj] = conditionBar.querySelector(
          `#${bj}-sound-filename`
        ).innerText;
      } else {
        const number = conditionBar.getAttribute("data-number")
          ? conditionBar.getAttribute("data-number")
          : "";
        var conditionObj = { UP: "", DOWN: "", FILE: "" };
        conditionBar.querySelectorAll("input").forEach((input) => {
          if (input.type == "number") {
            console.log(
              input.getAttribute("data-bj"),
              input.getAttribute("data-updown")
            );
            if (input.getAttribute("data-updown") == "up") {
              conditionObj.UP = input.value;
            } else if (input.getAttribute("data-updown") == "down") {
              conditionObj.DOWN = input.value;
            }
          }
        });
        conditionObj.FILE = conditionBar.querySelector(
          `#${bj}-${number}-sound-filename`
        ).innerText;

        sendObj[bj][number] = conditionObj;
      }
    });

    fetch("admin/setting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendObj),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      });

    console.log(sendObj);
  });

document
  .querySelector("#keyWordSaveBtn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    var bj = $("input:radio[name=selBJ]:checked").val();
    var plusMinus = $("input:radio[name=plusMinus]:checked").val();
    var keyWord = $("#keyWordInput").val();

    fetch("notification/setting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
          alert("성공적으로 저장되었습니다");
          renderNowKeyWord();
        } else {
          alert("저장에 실패했습니다");
        }
      });

    $("input:radio[name=selBJ]").prop("checked", false);
    $("input:radio[name=plusMinus]").prop("checked", false);
    $("#keyWordInput").val("");
  });

function deleteBtnClick(event) {
  event.preventDefault();
  var data = {
    keyWord: event.target.getAttribute("data-word"),
    bj: event.target.getAttribute("data-bj"),
    plusMinus: event.target.getAttribute("data-plusMinus"),
  };
  if (confirm("삭제하시겠습니까?")) {
    fetch("notification/setting", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.ok) {
          alert("성공적으로 저장되었습니다");
          renderNowKeyWord();
        } else {
          alert("저장에 실패했습니다");
        }
      });
  } else {
  }
  console.log(data);
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
  await fetch("/notification/setting")
    .then((response) => response.json())
    .then(async (data) => {
      var BJs = Object.keys(data.BJID);
      for (i in BJs) {
        renderKeyWord("plus", data.BJID[BJs[i]].plus, BJs[i]);
        renderKeyWord("minus", data.BJID[BJs[i]].minus, BJs[i]);
      }
      document.querySelector("#keywordPresent");
    });
}

async function renderConditions() {
  await fetch("/notification/setting")
    .then((response) => response.json())
    .then(async (data) => {
      Object.keys(data.BJSOUND).forEach((bj) => {
        // img change button element
        const buttonEl = document.createElement("button");
        buttonEl.classList.add(
          "bg-transparent",
          "border-0",
          "mx-auto",
          "imageBtn",
          "position-relative"
        );

        // file input element
        const fileInput = document.createElement("input");
        fileInput.setAttribute("type", "file");
        fileInput.setAttribute("id", `${bj}-image-file`);
        fileInput.classList.add("d-none");
        fileInput.addEventListener("change", (e) => {
          e.preventDefault();
          imageFileUpload(e.target, bj);
        });

        // img element
        const imgEl = document.createElement("img");
        imgEl.src = data.BJIMG[bj];
        imgEl.classList.add("img-thumbnail", "rounded", "d-block", "w-100");
        imgEl.setAttribute("id", `${bj}-image`);

        // img change Text div
        const changeText = document.createElement("div");
        changeText.innerText = "이미지 교체";
        changeText.classList.add("centerd");
        buttonEl.appendChild(changeText);
        buttonEl.appendChild(imgEl);

        // button add event
        buttonEl.addEventListener("click", (e) => {
          e.preventDefault();
          fileInput.click();
        });
        buttonEl.addEventListener("mouseenter", (e) => {
          e.preventDefault();
          e.target.querySelector(".centerd").style.display = "block";
        });
        buttonEl.addEventListener("mouseleave", (e) => {
          e.preventDefault();
          e.target.querySelector(".centerd").style.display = "none";
        });

        // img change button append
        document.querySelector(`#${bj}-conditions`).prepend(buttonEl);
        document.querySelector(`#${bj}-conditions`).append(fileInput);

        if (typeof data.BJSOUND[bj] == "object") {
          // if condition is for BJ

          Object.keys(data.BJSOUND[bj]).forEach((num) => {
            renderConditionBar(bj, num, data.BJSOUND[bj][num]);
          });
          addAddBtn(bj);
        } else if (typeof data.BJSOUND[bj] == "string") {
          // if condition is for Default
          const fileInput = document.createElement("input");
          fileInput.setAttribute("type", "file");
          fileInput.setAttribute("id", `${bj}-sound`);
          fileInput.classList.add("d-none");
          fileInput.addEventListener("change", (e) => {
            e.preventDefault();
            soundFileUpload(e.target, bj);
          });
          document.querySelector(`#${bj}-sound-filename`).innerText =
            data.BJSOUND[bj];
          document.querySelector(`#${bj}-conditions`).appendChild(fileInput);
        }
      });
    });
}

function renderConditionBar(bj, num, data) {
  let bjDiv = document.getElementById(bj + "-conditions");

  const conditionBar = document.createElement("div");

  conditionBar.classList.add(
    "d-flex",
    "justify-content-between",
    "conditionBar"
  );

  conditionBar.setAttribute("data-number", num);
  conditionBar.setAttribute("data-bj", bj);

  var html = `<div>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="up"
                  data-number="${num}"
                  value="${data ? data.UP : ""}"
                /><span>이상</span>
                <input
                  type="number"
                  data-bj="${bj}"
                  data-updown="down"
                  data-number="${num}"
                  value="${data ? data.DOWN : ""}"
                /><span>이하</span>
              </div>
              <div>
                <span>알림음 : </span>
                <span id="${bj}-${num}-sound-filename">${
    data ? data.FILE : ""
  }</span>
                <label class="btn btn-primary rounded" for="${bj}-${num}-sound">
                  파일 변경
                </label>
              </div>`;

  const fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("id", `${bj}-${num}-sound`);
  fileInput.classList.add("d-none");
  fileInput.addEventListener("change", (e) => {
    e.preventDefault();
    soundFileUpload(e.target, bj, num);
  });

  conditionBar.innerHTML = html;
  conditionBar.appendChild(fileInput);

  bjDiv.appendChild(conditionBar);
}

function renderKeyWord(mode, arr, BJ) {
  var querySel = `#keywordPresent .${BJ} .${mode}`;
  document.querySelector(querySel).innerHTML =
    mode == "plus" ? "플러스" : "마이너스";
  arr.forEach((element) => {
    var newBtn = document.createElement("Button");
    newBtn.innerText = element;
    newBtn.classList.add("btn", "btn-primary", "delete", "rounded");
    newBtn.setAttribute("data-word", element);
    newBtn.setAttribute("data-bj", BJ);
    newBtn.setAttribute("data-plusMinus", mode);
    newBtn.addEventListener("click", deleteBtnClick);

    document.querySelector(querySel).appendChild(newBtn);
  });
}

async function soundFileUpload(target, bj, num) {
  console.log(target.files[0]);
  let formData = new FormData();
  formData.append("bj", bj);
  if (num) {
    formData.append("num", num);
  }
  formData.append("file", target.files[0]);

  // 파일 음악파일 만 필터링
  // 기존 파일 삭제 여부
  await fetch("admin/setting/sound", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      let fileNameSpan;
      if (num) {
        fileNameSpan = `#${bj}-${num}-sound-filename`;
      } else {
        fileNameSpan = `#${bj}-sound-filename`;
      }
      alert("성공적으로 저장되었습니다");
      document.querySelector(fileNameSpan).innerText = response.originalname;
    });
}

async function imageFileUpload(target, bj) {
  console.log(target.files[0]);
  let formData = new FormData();
  formData.append("bj", bj);
  formData.append("file", target.files[0]);

  // 파일 음악파일 만 필터링
  // 기존 파일 삭제 여부
  await fetch("admin/setting/image", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      let fileNameSpan;
      fileNameSpan = `#${bj}-image`;
      alert("성공적으로 저장되었습니다");
      document.querySelector(
        fileNameSpan
      ).src = `images/${response.originalname}`;
    });
}

function addAddBtn(bj) {
  const addCondition = document.createElement("button");
  addCondition.innerText = "조건 추가";
  addCondition.setAttribute("data-bj", bj);
  addCondition.classList.add(
    "w-50",
    "mx-auto",
    "btn",
    "btn-secondary",
    "rounded"
  );
  addCondition.addEventListener("click", (e) => {
    e.preventDefault();
    const bj = e.target.getAttribute("data-bj");
    const num =
      document.querySelectorAll(`#${bj}-conditions .conditionBar`).length + 1;

    renderConditionBar(bj, num);
  });
  document.querySelector(`#${bj}-conditions`).appendChild(addCondition);
}
