const express = require('express');
const router = express.Router();
//Insert Model
const Deliver = require("../Model/DeliverModel");
//Insert Controller
const DeliverController = require("../Controllers/DeliverControllers");

router.get("/", DeliverController.getAllDeliveries);
router.post("/", DeliverController.addDelivery);
router.get("/:id", DeliverController.getById);
router.put("/:id", DeliverController.updateDelivery);
router.delete("/:id", DeliverController.deleteDelivery);


//export
module.exports = router;
