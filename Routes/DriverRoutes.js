const express = require("express");
const router = express.Router();
const DriverController = require("../Controllers/DriverController");

router.get("/", DriverController.getDrivers);
router.get("/:id", DriverController.getDriver);
router.post("/", DriverController.createDriver);
router.put("/:id", DriverController.updateDriver);
router.delete("/:id", DriverController.deleteDriver);

module.exports = router;
