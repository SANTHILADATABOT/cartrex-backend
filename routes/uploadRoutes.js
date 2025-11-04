const express = require("express");
const router = express.Router();
const photoUploadController = require("../controllers/photoUploadController");
const path = require("path");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/uplaodPhoto", upload.single("file"), photoUploadController.uploadFile);
// router.post('/uplaodPhoto', upload.single('fileFieldName'), photoUploadController.uplaodPhoto);

router.post("/updateTruckIcon",upload.single("file"),photoUploadController.uploadTruckIconAndUpdate);


module.exports = router;
