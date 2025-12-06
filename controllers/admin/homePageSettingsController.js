const HomepageSettings = require("../../models/HomepageSettings");
const { encrypt, decrypt } = require("../../utils/encryption");

const mask = (key) => {
  if (!key) return "";
  if (key.length <= 6) return "*".repeat(key.length);
  return key.slice(0, 6) + "*".repeat(key.length - 6);
};

// GET — return masked keys
exports.getKeys = async (req, res) => {
  try {
    const settings = await HomepageSettings.findOne({});
    if (!settings || !settings.apiKeys) return res.json({});

    const response = {};

    // Loop only inside apiKeys object
    for (const key in settings.apiKeys) {
      if (settings.apiKeys[key]) {
        const decrypted = decrypt(settings.apiKeys[key]);
        response[key] = mask(decrypted); // mask before sending
      }
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE — save encrypted values
exports.updateKeys = async (req, res) => {
  try {
    const incoming = req.body; 
    const encryptedData = {};

    for (const key in incoming) {
      const value = incoming[key];

      // Only encrypt real new values (ignore masked ****)
      if (value && typeof value === "string" && !value.includes("*")) {
        encryptedData[`apiKeys.${key}`] = encrypt(value);
      }
    }

    await HomepageSettings.findOneAndUpdate(
      {},
      { $set: encryptedData },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "API Keys updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


