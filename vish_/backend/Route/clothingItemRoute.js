// Route/clothingItemRoute.js
import express from "express";
import {
  getAllClothingItems,
  getClothingItemById,
  createClothingItem,
  updateClothingItem,
  deleteClothingItem,
  addMaterialToClothingItem,
  updateMaterialInClothingItem,
  removeMaterialFromClothingItem,
  importInitialClothingItems
} from "../Controller/clothingItemController.js";

const router = express.Router();

// Base routes for clothing items
router.get("/", getAllClothingItems);
router.get("/:id", getClothingItemById);
router.post("/", createClothingItem);
router.put("/:id", updateClothingItem);
router.delete("/:id", deleteClothingItem);

// Routes for materials within clothing items
router.post("/:id/materials", addMaterialToClothingItem);
router.put("/:id/materials/:materialId", updateMaterialInClothingItem);
router.delete("/:id/materials/:materialId", removeMaterialFromClothingItem);

// Import initial data from JSON
router.post("/import", importInitialClothingItems);

export default router;
