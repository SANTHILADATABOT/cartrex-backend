import express from "express";
import { getAllLocations } from "../../controllers/admin/locationlistingControlloer";

const router = express.Router();

// GET /api/locations
router.get("/getAllLocations", getAllLocations);

export default router;