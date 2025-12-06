const router = require("express").Router();
const { getKeys, updateKeys } = require("../../controllers/admin/homePageSettingsController");

const { protect, authorize } = require("../../middleware/auth");

// Only allow admins
router.get("/gethomepagekeys", getKeys);
router.put("/updatehomepageKeys", updateKeys);

// authorize("admin"),
module.exports = router;