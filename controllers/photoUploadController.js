const path = require("path");
const multer = require("multer");

// Store uploaded files in /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // ✅ extract original extension (.jpg, .png, etc.)
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext; // ✅ keep extension
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Export both multer instance and handler correctly
exports.upload = upload;

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: fileUrl });
};

// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // If you want dynamic folders, create storage like this:
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let subFolder = 'others';

//     if (file.fieldname === 'masterIcon') {
//       subFolder = 'master_icons';
//     } else if (file.fieldname === 'carrier_profilePic') {
//       subFolder = 'carrier_profile_pics';
//     } else if (file.fieldname === 'insuranceDoc') {
//       subFolder = 'insurance_pictures';
//     }

//     const fullDir = path.join(__dirname, 'uploads', subFolder);
//     if (!fs.existsSync(fullDir)) {
//       fs.mkdirSync(fullDir, { recursive: true });
//     }
//     cb(null, fullDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + '-' + file.originalname;
//     cb(null, uniqueName);
//   }
// });
// const upload = multer({ storage });
// exports.upload = upload;

// // Controller function:
// exports.uploadPhoto = (req, res) => {
//   // With upload.fields(), files are in req.files, not req.file
//   const files = req.files;
//   if (!files || Object.keys(files).length === 0) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   // Example: handle masterIcon if present
//   let uploadedFieldName;
//   if (files.masterIcon && files.masterIcon.length > 0) {
//     uploadedFieldName = 'masterIcon';
//   } else if (files.carrier_profilePic && files.carrier_profilePic.length > 0) {
//     uploadedFieldName = 'carrier_profilePic';
//   } else if (files.insuranceDoc && files.insuranceDoc.length > 0) {
//     uploadedFieldName = 'insuranceDoc';
//   }

//   const fileObj = uploadedFieldName ? files[uploadedFieldName][0] : null;

//   if (!fileObj) {
//     return res.status(400).json({ success: false, message: "No file found in the expected fields" });
//   }

//   // Determine URL folder based on fieldname
//   let folder = 'others';
//   if (uploadedFieldName === 'masterIcon') folder = 'master_icons';
//   else if (uploadedFieldName === 'carrier_profilePic') folder = 'carrier_profile_pics';
//   else if (uploadedFieldName === 'insuranceDoc') folder = 'insurance_pictures';

//   const url = `${req.protocol}://${req.get("host")}/uploads/${folder}/${fileObj.filename}`;
//   res.status(200).json({ success: true, url });
// };