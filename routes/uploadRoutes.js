const express = require("express");
const router = express.Router();
const photoUploadController = require("../controllers/photoUploadController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/uplaodPhoto", upload.single("file"), photoUploadController.uploadFile);
// router.post('/uplaodPhoto', upload.single('fileFieldName'), photoUploadController.uplaodPhoto);

// router.post(
//   '/uplaodPhoto',
//   upload.fields([
//     { name: 'masterIcon', maxCount: 1 },
//     { name: 'carrier_profilePic', maxCount: 1 },
//     { name: 'insuranceDoc', maxCount: 1 }
//   ]),
//   photoUploadController.uploadPhoto
// );
module.exports = router;
