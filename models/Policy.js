const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema(
  {
    type: {
      type: String,
     
      trim: true,
       enum: ["privacy_policy", "terms_condition", "account_deletion"]
    },
    content: {
      type: String,
  
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", PolicySchema);
