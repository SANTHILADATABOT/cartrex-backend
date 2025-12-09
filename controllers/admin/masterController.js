const Category = require("../../models/Category");
const SubCategory = require("../../models/Subcategory");
const fs = require("fs");
const path = require("path");

const getModel = (type) => {
  if (type === 'subcategory') return SubCategory;
  return Category;
};

exports.create = async (req, res) => {
  try {
    const { type } = req.query; 
    const Model = getModel(type);
    if (type === 'subcategory') {
      const category = await Category.findById(req.body.category);
      if (!category || category.deleteStatus === 1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
    }

    const doc = new Model({
      ...req.body,
      audit: { createdBy: req.userId, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    });

    await doc.save();
   if (req.file) {
      const uploadsDir = path.join(__dirname, "../../upload/vehiclecatimages");
      // Make sure folder exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      if (doc.image) {
        const oldImagePath = path.join(__dirname, "../../", doc.image);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // delete old file
          console.log("Old image deleted:", oldImagePath);
        }
      }

        const ext = path.extname(req.file.originalname);

        const finalFileName = `category_${doc._id}${ext}`;
        const finalPath = path.join(uploadsDir, finalFileName);

        // Save the new file
        fs.writeFileSync(finalPath, req.file.buffer);

        // Update DB path
        doc.icon_url = `/upload/vehiclecatimages/${finalFileName}`;
        await doc.save();
      }

    const message =
      type === 'category'
        ? 'Category created successfully'
        : 'Subcategory created successfully';

    res.status(201).json({ success: true, message, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { type } = req.query;
    const { id } = req.params;
    const Model = getModel(type);
console.log('req.body=>',req.body)
    // Find existing document
    const existing = await Model.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `${type} not found` });
    }
   
    // Update fields (except image here)
    Object.assign(existing, req.body);
    existing.audit.updatedAt = new Date();
    existing.audit.updatedBy = req.userId;

    // -----------------------------
    // 🔥 FILE UPDATE LOGIC
    // -----------------------------
    if (req.file) {
      const uploadsDir = path.join(__dirname, "../../upload/vehiclecatimages");

      // Ensure folder exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // 🔥 Delete old image if exists
      if (existing.image) {
        const oldPath = path.join(__dirname, "../../", existing.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // New file name: originalName_id.ext
      const ext = path.extname(req.file.originalname);
      const newFileName = `category__${existing._id}${ext}`;

      const savePath = path.join(uploadsDir, newFileName);

      // Save new file from memory
      fs.writeFileSync(savePath, req.file.buffer);

      // Save updated image path in DB
      existing.icon_url = `/upload/vehiclecatimages/${newFileName}`;
    }

    // Save final updated record
    await existing.save();

    const message =
      type === "category"
        ? "Category updated successfully"
        : "Subcategory updated successfully";

    res.status(200).json({ success: true, message, data: existing });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateold = async (req, res) => {
  try {
    const { type } = req.query;
    const { id } = req.params;
    const Model = getModel(type);

    const updated = await Model.findByIdAndUpdate(
      id,
      { ...req.body, 'audit.updatedAt': new Date(), 'audit.updatedBy': req.userId },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: `${type} not found` });

      const message =
      type === 'category'
        ? 'Category Updated successfully'
        : 'Subcategory Updated successfully';

    res.status(200).json({ success: true, message, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.delete = async (req, res) => {
  try {
    const type = (req.query.type || "").replace(/"/g, "");
    const { id } = req.params;
    const Model = getModel(type);

    // 1️⃣ Find the record first
    const doc = await Model.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: `${type} not found` });
    }

    // -----------------------------
    // 🔥 2️⃣ DELETE IMAGE FILE (if exists)
    // -----------------------------
    if (doc.icon_url) {
      const imagePath = path.join(__dirname, "../../", doc.icon_url); // absolute path

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete file
        console.log("Deleted file:", imagePath);
      }
    }

    // -----------------------------
    // 🔥 3️⃣ Soft-delete in Database
    // -----------------------------
    doc.deleteStatus = 1;
    doc.audit.deletedAt = new Date();
    doc.audit.deletedBy = req.userId;

    await doc.save();

    res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
      data: doc
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// exports.delete = async (req, res) => {
//   try {
//     // const { type } = req.query;
//      const type = (req.query.type  || '').replace(/"/g, '');
//     const { id } = req.params;
//     const Model = getModel(type);
//     const deleted = await Model.findByIdAndUpdate(
//       id,
//       { deleteStatus: 1, 'audit.deletedAt': new Date(), 'audit.deletedBy': req.userId },
//       { new: true }
//     );

//     if (!deleted) return res.status(404).json({ success: false, message: `${type} not found` });



//     res.status(200).json({ success: true, message: `${type} deleted successfully`,data: deleted });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


exports.getallcategories = async (req, res) => {
  try {
    const categories = await Category.find({ deleteStatus: 0 })
    res.status(200).json({
      success: true,
      //: categories.length,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getallsubcategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ deleteStatus: 0 })
      .populate("category", "category")

    res.status(200).json({
      success: true,
      //count: subcategories.length,
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getcategorysubcategories = async (req, res) => {
  try {
    const data = await Category.find({ deleteStatus: 0 })
      .populate({
        path: 'subcategories',
        match: { deleteStatus: 0 },
      });

    res.status(200).json({
      success: true,
      message: 'All categories with subcategories fetched successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};