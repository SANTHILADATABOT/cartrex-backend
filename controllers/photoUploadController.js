const fs = require("fs");
const path = require("path");
const multer = require("multer");
const MasterTruckType = require('../models/MasterTruckType.js');
const TruckCategory = require("../models/Category.js");
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
exports.uploadstoragefile = upload;

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const fileUrl = `uploads/master_icons/${req.file.originalname}`;
  res.status(200).json({ success: true, url: fileUrl });
};









//category id of category tabel

// exports.uploadTruckIconAndUpdate = async (req, res) => {
//   try {
//     // ✅ Check if file exists
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No truck icon uploaded",
//       });
//     }

//     // ✅ Validate categoryId
//     const { categoryId } = req.body;
//     if (!categoryId) {
//       return res.status(400).json({
//         success: false,
//         message: "categoryId is required to update icon",
//       });
//     }

//     // ✅ Create unique filename + path
//     const ext = path.extname(req.file.originalname);
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
//     const uploadDir = path.join(__dirname, "../uploads/truck_icons");
//     const filePath = path.join(uploadDir, uniqueName);
//     const fileUrl = `${req.protocol}://${req.get("host")}/uploads/truck_icons/${uniqueName}`;

//     // ✅ First, update MasterTruckType
//     const masterUpdate = await MasterTruckType.findByIdAndUpdate(
//       categoryId,
//       { icon_url: fileUrl },
//       { new: true }
//     );

//     if (!masterUpdate) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found in MasterTruckType",
//       });
//     }

//     // ✅ Then, update the Category table (if it exists)
//     const categoryUpdate = await TruckCategory.findOneAndUpdate(
//       { masterTypeId: categoryId }, // assuming you have a reference field
//       { icon_url: fileUrl },
//       { new: true }
//     );

//     // ✅ Only save the file if DB update(s) succeeded
//     fs.mkdirSync(uploadDir, { recursive: true });
//     fs.writeFileSync(filePath, req.file.buffer);

//     res.status(200).json({
//       success: true,
//       message: "Truck icon updated successfully",
//       fileUrl,
//       updatedMaster: masterUpdate,
//       updatedCategory: categoryUpdate || null,
//     });
//   } catch (err) {
//     console.error("Error updating truck icon:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };


exports.uploadTruckIconAndUpdate = async (req, res) => {
  try {
    // ✅ Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No truck icon uploaded",
      });
    }

    // ✅ Validate categoryId
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required to update icon",
      });
    }

    // ✅ Generate file name and relative path
    const ext = path.extname(req.file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const uploadDir = path.join(__dirname, "../uploads/truck_icons");
    const filePath = path.join(uploadDir, uniqueName);

    // ✅ Relative path to store in DB (without domain)
    const relativePath = `uploads/truck_icons/${uniqueName}`;

    // ✅ Update Category table
    const categoryUpdate = await TruckCategory.findByIdAndUpdate(
      categoryId,
      { icon_url: relativePath },
      { new: true }
    );

    if (!categoryUpdate) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ✅ Save file only after successful DB update
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, req.file.buffer);

    res.status(200).json({
      success: true,
      message: "Truck icon updated successfully",
      iconPath: relativePath, // <- stored path (relative)
      updatedCategory: categoryUpdate,
    });
  } catch (err) {
    console.error("Error updating truck icon:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
