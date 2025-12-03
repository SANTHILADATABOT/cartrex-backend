const Policy = require("../../models/Policy");

// CREATE or UPDATE a policy
exports.savecontent = async (req, res) => {
  try {
    const { type, content } = req.body;

    const policy = await Policy.findOne({   type  });

    if (policy) {
      policy.content = content;
      await policy.save();
      return res.json({   success: true,message: `${type} updated successfully`, policy });
    }

    const newPolicy = await Policy.create({ type, content });
    res.status(200).json({ message: `${type} created successfully`, policy: newPolicy });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a policy by type
exports.getPolicy = async (req, res) => {
  try {
    const { type } = req.params;
    console.log("type",type)
   const policy = await Policy.findOne({ type });


    if (!policy) return res.status(404).json({ message: "contentByType not found" });

    
    res.status(200).json({
      success: true,
      data: {
    policy
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a policy
exports.deletePolicy = async (req, res) => {
  try {
    const { type } = req.params;

    const deleted = await Policy.destroy({ where: { type } });

    if (!deleted) return res.status(404).json({ message: "Policy not found" });

    res.json({ message: `${type} deleted successfully` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
