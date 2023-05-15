const uploadInput = document.querySelector("#uploadInput");
const preview = document.querySelector(".preview");
const previewImg = document.querySelector(".preview img");
const generateCrop = document.querySelector(".generate-crop");

// const i = new Image();
// i.src = "http://localhost:3030/uploads/test.jpg";

// i.onload = function () {
//   console.dir(i);
// };

uploadInput.addEventListener("change", function (e) {
  const file = this.files[0];
  console.log(file);
  const fr = new FileReader();
  fr.onload = function (e) {
    previewImg.src = e.target.result;
    console.dir(previewImg);
  };
  fr.readAsDataURL(file);
});

generateCrop.addEventListener("click", function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // console.log("canvas,", previewImg.getBoundingClientRect());
  console.log(previewImg.naturalHeight / previewImg.clientHeight);
  console.log(previewImg.naturalWidth / previewImg.clientWidth);
  const xMultiple = previewImg.naturalWidth / previewImg.clientWidth;
  const yMultiple = previewImg.naturalHeight / previewImg.clientHeight;
  const data = {
    x: (150 - previewImg.offsetLeft) * xMultiple, // 裁剪框距离图片左边的距离
    y: (55 - previewImg.offsetTop) * yMultiple, // 裁剪框距离图片上边的距离
    cutWidth: 100 * xMultiple, // 裁剪框的宽度
    cutHeight: 100 * yMultiple, // 100, // 裁剪框的高度
    width: 100, // 最终显示的宽度
    height: 100, // 最终显示的高度
  };
  canvas.width = data.width;
  canvas.height = data.height;
  ctx.drawImage(
    previewImg,
    data.x,
    data.y,
    data.cutWidth,
    data.cutHeight,
    0,
    0,
    data.width,
    data.height
  );

  canvas.toBlob((blob) => {
    const file = new File([blob], `${Date.now()}.jpg`);
    console.log(file, `${Date.now()}.jpg`);
    const formData = new FormData();
    formData.append("avatar", file);
    axios({
      url: "/upload",
      method: "post",
      data: formData,
    });
  });

  document.body.appendChild(canvas);
});
