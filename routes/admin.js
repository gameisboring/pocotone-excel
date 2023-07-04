var express = require("express");
var router = express.Router();
require("dotenv").config();
const multer = require("multer");
var path = require("path");
const fs = require("fs");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

const SoundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.normalize("public/sounds/" + req.body.bj));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const ImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.normalize("public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, "noti.png");
  },
});

const SoundUpload = multer({ storage: SoundStorage });
const ImageUpload = multer({ storage: ImageStorage });

router.get("/", function (req, res) {
  res.render("admin/index", { title: "admin main", port: process.env.PORT });
});

router.get("/setting", function (req, res) {
  res.render("admin/setting", { title: "admin setting" });
});

router.post(
  "/setting/sound",
  SoundUpload.fields([{ name: "file" }, { name: "bj" }, { name: "num" }]),
  function (req, res) {
    if (req.body) {
      if (!fs.existsSync(path.join("config", "notiConfig.json"))) {
        console.log(`please write file "notiConfig.json"`);
      } else {
        let setting = JSON.parse(
          fs.readFileSync(path.join("config", "notiConfig.json"))
        );

        console.log(setting.BJSOUND[req.body.bj][req.body.num].FILE);
        setting.BJSOUND[req.body.bj][req.body.num].FILE =
          req.files.file[0].originalname;
        try {
          fs.writeFileSync(
            path.join("config", "notiConfig.json"),
            JSON.stringify(setting)
          );
        } catch (error) {
          console.log(error);
        }
      }
    }
    res.status(200);
    res.send(req.files.file[0]);
  }
);

module.exports = router;
