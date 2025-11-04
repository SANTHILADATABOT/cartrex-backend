const fs = require("fs");
const path = require("path");
const MasterTruckType = require('../models/MasterTruckType.js');
const TruckCategory = require("../models/Category.js");



exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const fileUrl = `uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: fileUrl });
};


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
