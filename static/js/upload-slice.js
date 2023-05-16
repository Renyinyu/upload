const fileInput = document.querySelector("#fileInput");

console.dir(fileInput);

fileInput.addEventListener("change", async function (e) {
  const file = fileInput.files[0];
  const chunks = sliceFile(file);
  console.log("chunks:", chunks);
  const md = await hash(chunks);
  const result = await md5(file, 2 * 1024 * 1024);
  console.log("hash 1:", md);
  console.log("hash 2: " + result);
});

function sliceFile(file, chunkSize = 2 * 1024 * 1024) {
  if (!file) return;
  let result = [];
  // 方法1:
  for (let i = 0; i < file.size; i += chunkSize) {
    const blob = file.slice(i, i + chunkSize);
    result.push(blob);
  }

  // 方法2:
  // const chunks = Math.ceil(file.size / chunkSize);
  // for (let i = 0; i < chunks; i++) {
  //   const current = i * chunkSize;
  //   const blob = file.slice(current, current + chunkSize);
  //   result.push(blob);
  // }
  return result;
}

function hash(chunks) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let i = 0;
    function _load() {
      if (i >= chunks.length) {
        resolve(spark.end());
      } else {
        fileReader.readAsArrayBuffer(chunks[i]);
      }
    }
    fileReader.onload = function (e) {
      spark.append(e.target.result);
      i++;
      _load();
    };

    fileReader.onerror = function (e) {
      reject("error:", e);
    };

    _load();
  });
}

function md5(file, chunkSize) {
  // let _this = this;
  return new Promise((resolve, reject) => {
    let blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    let chunks = Math.ceil(file.size / chunkSize);
    console.log("chunks:", chunks);
    let currentChunk = 0;
    let spark = new SparkMD5.ArrayBuffer(); //追加数组缓冲区。
    let fileReader = new FileReader(); //读取文件
    fileReader.onload = function (e) {
      spark.append(e.target.result);
      currentChunk++;
      // _this.md5Obj.percent = Math.floor((currentChunk / chunks) * 100);
      // _this.container.file.MD5Progress = _this.md5Obj.percent;
      // if (_this.onMD5Progress(_this.container.file) === false) return;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        // _this.md5Obj.md5 = spark.end(); //完成md5的计算，返回十六进制结果。
        resolve(spark.end());
      }
    };

    fileReader.onerror = function (e) {
      reject(e);
    };

    function loadNext() {
      let start = currentChunk * chunkSize;
      let end = start + chunkSize;
      end > file.size && (end = file.size);
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  });
}
