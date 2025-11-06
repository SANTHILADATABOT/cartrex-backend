const express = require("express");
const router = express.Router();
const photoUploadController = require("../controllers/photoUploadController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadfile = multer({ dest: "uploads/master_icons" });

router.post("/uplaodPhoto", photoUploadController.uploadstoragefile.single("file"), photoUploadController.uploadFile);

router.post("/updateTruckIcon",upload.single("file"),photoUploadController.uploadTruckIconAndUpdate);


module.exports = router;
