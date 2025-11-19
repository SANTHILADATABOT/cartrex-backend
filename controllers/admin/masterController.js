const Category = require("../../models/Category");
const SubCategory = require("../../models/Subcategory");

const getModel = (type) => {
  if (type === 'subcategory') return SubCategory;
  return Category;
};

exports.create = async (req, res) => {
  try {
    const { type } = req.query; 
    const Model = getModel(type);
console.log("req.body in create",req.body,"req.query",req.query)
    if (type === 'subcategory') {
      const category = await Category.findById(req.body.category);
      console.log("category received",category)
      if (!category || category.deleteStatus === 1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
    }

    const doc = new Model({
      ...req.body,
      audit: { createdBy: req.userId, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    });

    await doc.save();

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
    // const { type } = req.query;
     const type = (req.query.type  || '').replace(/"/g, '');
    const { id } = req.params;
    const Model = getModel(type);
console.log("type",type,"id",id)
    const deleted = await Model.findByIdAndUpdate(
      id,
      { deleteStatus: 1, 'audit.deletedAt': new Date(), 'audit.deletedBy': req.userId },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ success: false, message: `${type} not found` });



    res.status(200).json({ success: true, message: `${type} deleted successfully`,data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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