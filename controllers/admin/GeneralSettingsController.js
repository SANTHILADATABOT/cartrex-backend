// const Policy = require("../../models/Policy");

// CREATE or UPDATE a policy
exports.saveGeneral = async (req, res) => {
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



