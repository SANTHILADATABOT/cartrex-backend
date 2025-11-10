
const Location = require('../../models/Location');
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, "city state stateCode zipcode")
      .sort({ state: 1, city: 1 }); // optional sorting

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("❌ Error fetching locations:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
