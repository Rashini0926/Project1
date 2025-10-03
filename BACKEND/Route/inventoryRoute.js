// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../Controllers/inventoryController"); // adjust casing if your folder is "Controllers"

// Specific routes first (so they don't clash with "/:id")
router.get("/low-stock", inventoryController.getLowStock);
router.patch("/:id/adjust", inventoryController.adjustStock);

// CRUD
router.post("/", inventoryController.addItem);
router.get("/", inventoryController.getAllItems);
router.get("/:id", inventoryController.getItemById);

// Update (both full PUT and partial PATCH)
router.put("/:id", inventoryController.updateItem);
router.patch("/:id", inventoryController.patchItem);
// GET /inventory/categories
router.get("/categories", inventoryController.getRawMaterialCategories);

router.delete("/:id", inventoryController.deleteItem);

module.exports = router;
