const express = require('express');
const router = express.Router();
const controller = require("../../controllers/admin/masterController");
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
// Use ?type=category or ?type=subcategory
router.post('/create',upload.single("file"), controller.create);
router.put('/update/:id',upload.single("file"), controller.update);
router.delete('/delete/:id', controller.delete);
router.get("/getallcategories", controller.getallcategories);
router.get("/getallsubcategories", controller.getallsubcategories);
router.get("/getcategorysubcategories", controller.getcategorysubcategories);

module.exports = router;
