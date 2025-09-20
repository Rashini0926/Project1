const express = require("express");
const { addLocationUpdate, getHistory } = require("../Controllers/TrackingController");

const router = express.Router();

// POST: Driver sends GPS location
router.post("/:deliveryId/location", addLocationUpdate);

// GET: Dashboard fetches history
router.get("/:deliveryId/history", getHistory);

module.exports = router;
