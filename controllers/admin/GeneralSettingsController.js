const HomepageSettings = require("../../models/HomepageSettings");

exports.saveGeneral = async (req, res) => {
  try {
    const { projectName, footerText, apiKeys } = req.body;

    const logoFiles = req.files["logo"]?.map(f => f.buffer) || [];
    const faviconFiles = req.files["favicon"]?.map(f => f.buffer) || [];

    const data = {
      projectName,
      footerText,
      apiKeys: apiKeys ? JSON.parse(apiKeys) : {}, // if sending apiKeys as JSON string
      logo: logoFiles,
      favicon: faviconFiles,
      preview: {
        logo: logoFiles,
        favicon: faviconFiles
      }
    };

    let settings = await HomepageSettings.findOne();

    if (settings) {
      Object.assign(settings, data);
      await settings.save();
      return res.json({ success: true, message: "Updated", settings });
    }

    const newSettings = await HomepageSettings.create(data);
    res.json({ success: true, message: "Created", settings: newSettings });

  } catch (err) {
    console.error("Error saving settings:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getGeneral = async (req, res) => {
  try {
    const settings = await HomepageSettings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "No homepage settings found",
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });

  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: err.message });
  }
};