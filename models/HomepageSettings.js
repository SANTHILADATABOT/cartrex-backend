const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    projectName: { type: String, default: "" },

    logo: { type: [String], default: [] },
    favicon: { type: [String], default: [] },

    preview: {
      logo: { type: [String], default: [] },
      favicon: { type: [String], default: [] }
    },

    // API KEYS GROUPED HERE
    apiKeys: {
      stripe: { type: String, default: "" },
      sendgrid: { type: String, default: "" },
      twilio: { type: String, default: "" },
      firebase: { type: String, default: "" },
      googlemaps: { type: String, default: "" }
    },

    footerText: { type: String, default: "" },

    footerLinks: {
      type: [
        {
          label: String,
          url: String
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageSettings", settingsSchema);
