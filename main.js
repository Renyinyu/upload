const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "./static")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "./static/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

app.get("/upload/view", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/index.html"));
});

app.get("/upload/base64", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/upload-base64.html"));
});

app.get("/upload/crop", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/upload-crop.html"));
});

app.post("/upload", upload.single("avatar"), (req, res) => {
  res.send({
    msg: "ok",
    data: `http://localhost:3030/uploads/${req.file.filename}`,
  });
});

app.post("/upload/base64", (req, res) => {
  const body = req.body;
  const data = Buffer.from(body.data, "base64");

  const filename = `${decodeURIComponent(body.filename)}.${body.ext}`;
  fs.writeFile(
    path.resolve(__dirname, `static/uploads/${filename}`),
    data,
    (e) => {
      console.log("erroer: ", e);
    }
  );
  res.send({
    msg: "ok",
    data: `http://localhost:3030/uploads/${filename}`,
  });
});

app.listen(3030);
