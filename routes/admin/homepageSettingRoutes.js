const router = require("express").Router();
const { getKeys, updateKeys } = require("../../controllers/admin/homePageSettingsController");
const GeneralSettingsController = require("../../controllers/admin/GeneralSettingsController")

const { protect, authorize } = require("../../middleware/auth");
const multer = require("multer");

// Memory storage for files (like your photoUploadController)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Only allow admins
router.get("/gethomepagekeys", getKeys);
router.put("/updatehomepageKeys", updateKeys);
router.post(
  "/savegeneral",
  upload.fields([
    { name: "logo", maxCount: 10 },
    { name: "favicon", maxCount: 10 }
  ]),
  GeneralSettingsController.saveGeneral
);
router.get("/getgeneral", GeneralSettingsController.getGeneral);

// authorize("admin"),
module.exports = router;