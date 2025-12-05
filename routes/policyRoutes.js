const express = require("express");
const router = express.Router();
const policyController = require("../controllers/admin/policyController");

// Upsert (Create or Update)
router.post("/savecontent", policyController.savecontent);

// Get policy
router.get("/getContentByType/:type", policyController.getPolicy);

// Delete
router.delete("/policy/:type", policyController.deletePolicy);

module.exports = router;
