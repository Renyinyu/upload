const doms = {
  avatarInput: document.querySelector("#avatarInput"),
  uploadWrapper: document.querySelector(".upload-wrapper"),
  selectImage: document.querySelector(".upload-wrapper .init-status"),
  progressWrapper: document.querySelector(".upload-wrapper .progress-wrapper"),
  previewEl: document.querySelector(".upload-wrapper .preview"),
  previewImg: document.querySelector(".upload-wrapper .preview img"),
  cancelUploadBtn: document.querySelector(".upload-wrapper .cancel-upload"),
};

let cancelUpload = null;

function setUploadStatus(status) {
  doms.uploadWrapper.classList = `upload-wrapper ${status}`;
}

function setPercent(val) {
  doms.progressWrapper.style.setProperty("--percent", val);
}

setUploadStatus("select");

const reg = /(.+)\.([a-zA-Z]+)/;

function upload(file, onProgress, onFinished) {
  console.log(file);
  const controller = new AbortController();
  const fr = new FileReader();
  fr.onload = function (e) {
    const regResult = file.name.match(reg);
    const base64 = e.target.result.split(",")[1];
    doms.previewImg.src = e.target.result;
    axios({
      url: "/upload/base64",
      method: "post",
      data: {
        filename: encodeURIComponent(regResult[1]),
        ext: regResult[2],
        data: base64,
      },
      signal: controller.signal,
      onUploadProgress: function (progressEvent) {
        // Do whatever you want with the native progress event
        // console.log(progressEvent);
        const percent = Math.round(progressEvent.progress * 100);
        onProgress(percent);
      },
    }).then((res) => {
      onFinished(res.data.data);
    });
  };
  onProgress(0);
  setUploadStatus("upload");
  fr.readAsDataURL(file);

  return function () {
    controller.abort();
    setUploadStatus("select");
    avatarInput.value = "";
    cancelUpload = null;
  };
}

const changeFileHandler = function () {
  cancelUpload = upload(
    doms.avatarInput.files[0],
    (p) => {
      setPercent(p);
    },
    () => {
      setUploadStatus("result");
      avatarInput.value = "";
    }
  );
};

doms.avatarInput.addEventListener("change", changeFileHandler);

doms.selectImage.addEventListener("click", function (e) {
  doms.avatarInput.click();
});

doms.previewEl.addEventListener("click", function (e) {
  doms.avatarInput.click();
});

doms.cancelUploadBtn.addEventListener("click", function (e) {
  e.preventDefault();
  typeof cancelUpload == "function" && cancelUpload();
});

// 当浏览器不支持input的拖拽上传时, 使用h5 drag api兼容
doms.avatarInput.addEventListener("dragenter", function (e) {
  e.preventDefault();
});

doms.avatarInput.addEventListener("dragover", function (e) {
  e.preventDefault();
});

doms.avatarInput.addEventListener("drop", function (e) {
  e.preventDefault();
  // PS: 浏览器直接打印e事件对象的dataTransfer.files属性length为0,可能为浏览器Bug
  console.log("drop", e.dataTransfer.files);
  doms.avatarInput.files = e.dataTransfer.files;
  changeFileHandler();
});
